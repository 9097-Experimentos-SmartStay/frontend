import { CalendarDate } from '@/shared/domain/calendar-date.js';

/**
 * Filters of GET /audit-logs (§3.1). Every filter is optional.
 * `from`/`to` are calendar days in the user's timezone, turned into an inclusive instant range.
 */
export class AuditLogQuery {
    /**
     * @param {Object} params
     * @param {number|null} [params.userId] - Matches who acted OR the account acted upon.
     * @param {string|null} [params.action]
     * @param {CalendarDate|null} [params.from]
     * @param {CalendarDate|null} [params.to]
     * @param {number} [params.page=1]
     * @param {number} [params.pageSize=20] - Max 100.
     */
    constructor({ userId = null, action = null, from = null, to = null, page = 1, pageSize = 20 } = {}) {
        this.userId = userId;
        this.action = action;
        this.from = CalendarDate.from(from);
        this.to = CalendarDate.from(to);
        this.page = Math.max(1, page);
        this.pageSize = Math.min(100, Math.max(1, pageSize));
        Object.freeze(this);
    }

    /** @returns {boolean} True when the date range is reversed (the API answers 400). */
    get hasInvalidRange() {
        return !!(this.from && this.to && this.to.isBefore(this.from));
    }

    /**
     * @param {Partial<AuditLogQuery>} changes
     * @returns {AuditLogQuery}
     */
    with(changes) {
        return new AuditLogQuery({ ...this, ...changes });
    }
}
