import { AuditLogEntry, AuditLogPage } from '../../domain/model/audit-log-entry.entity.js';
import { AuditDetails } from '../../domain/model/audit-details.js';

const LOCKED_UNTIL = /^Locked until (\S+)$/;
const ROLE_CHANGE = /^(\S+) -> (\S+)$/;

/**
 * GET /audit-logs (§3.1) ↔ {@link AuditLogPage}.
 */
export class AuditLogAssembler {
    /**
     * @param {Object} resource
     * @returns {AuditLogEntry}
     */
    static toEntityFromResource(resource) {
        return new AuditLogEntry({
            id: resource.id,
            occurredAt: new Date(resource.occurredAt),
            action: resource.action,
            outcome: resource.outcome,
            actorUserId: resource.actorUserId ?? null,
            actorEmail: resource.actorEmail ?? null,
            targetUserId: resource.targetUserId ?? null,
            targetEmail: resource.targetEmail ?? null,
            hotelId: resource.hotelId ?? null,
            ipAddress: resource.ipAddress ?? null,
            details: AuditLogAssembler.toDetailsFromText(resource.details),
        });
    }

    /**
     * The API records the details as English text ("Role: reception -> housekeeping", "Method: RecoveryCode; Reason:
     * InvalidRecoveryCode", "Locked until 2026-09-18T10:00:00Z", "Remaining recovery codes: 9"). They are parsed here
     * so the view shows them translated; text in an unknown format is left out rather than shown in English.
     * @param {string|null|undefined} text
     * @returns {AuditDetails|null}
     */
    static toDetailsFromText(text) {
        if (!text) return null;
        const locked = LOCKED_UNTIL.exec(text.trim());
        if (locked) {
            const lockedUntil = new Date(locked[1]);
            return Number.isNaN(lockedUntil.getTime()) ? null : new AuditDetails({ lockedUntil });
        }
        const fields = {};
        for (const part of text.split(';')) {
            const separator = part.indexOf(':');
            if (separator < 0) return null;
            const key = part.slice(0, separator).trim();
            const value = part.slice(separator + 1).trim();
            if (key === 'Role') {
                const change = ROLE_CHANGE.exec(value);
                if (change) [fields.previousRole, fields.newRole] = [change[1], change[2]];
                else fields.role = value;
            } else if (key === 'Reason') fields.reason = value;
            else if (key === 'Method') fields.method = value;
            else if (key === 'Remaining recovery codes' && /^\d+$/.test(value)) fields.remainingRecoveryCodes = Number(value);
            else return null;
        }
        return new AuditDetails(fields);
    }

    /**
     * @param {Object} response - Axios response.
     * @returns {AuditLogPage}
     */
    static toPageFromResponse(response) {
        const body = response?.data ?? {};
        return new AuditLogPage({
            items: Array.isArray(body.items) ? body.items.map(AuditLogAssembler.toEntityFromResource) : [],
            page: body.page ?? 1,
            pageSize: body.pageSize ?? 20,
            totalCount: body.totalCount ?? 0,
            totalPages: body.totalPages ?? 0,
        });
    }

    /**
     * The date filters are calendar days picked in the user's timezone; the API compares instants
     * (inclusive), so `from` becomes the local start of that day and `to` the local end of it.
     * @param {import('../../domain/commands/audit-log.query.js').AuditLogQuery} query
     * @returns {Record<string, string|number>}
     */
    static toQueryParams(query) {
        const params = { page: query.page, pageSize: query.pageSize };
        if (query.userId != null) params.userId = query.userId;
        if (query.action) params.action = query.action;
        if (query.from) params.from = query.from.toDate().toISOString();
        if (query.to) {
            const endOfDay = query.to.toDate();
            endOfDay.setHours(23, 59, 59, 999);
            params.to = endOfDay.toISOString();
        }
        return params;
    }
}
