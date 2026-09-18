import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { StayPeriod } from '../model/stay-period.js';

/**
 * US-51 scenario 1: rooms free for the whole stay, in one hotel (or in every hotel when `hotelId` is null).
 */
export class SearchAvailabilityQuery {
    /**
     * @param {Object} params
     * @param {number|null} params.hotelId
     * @param {StayPeriod} params.stay
     */
    constructor({ hotelId = null, stay }) {
        this.hotelId = hotelId ? Number(hotelId) : null;
        this.stay = stay;
        Object.freeze(this);
    }

    /**
     * @param {CalendarDate} [today]
     * @returns {string|null} A StayRuleError (US-51 scenario 4), or null when the search can run.
     */
    validate(today = CalendarDate.today()) {
        return this.stay.validate(today);
    }
}
