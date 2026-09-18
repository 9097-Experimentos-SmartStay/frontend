import { AuditLogEntry, AuditLogPage } from '../../domain/model/audit-log-entry.entity.js';

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
            details: resource.details ?? null,
        });
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
