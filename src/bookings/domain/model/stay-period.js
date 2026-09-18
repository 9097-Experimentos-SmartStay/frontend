import { CalendarDate } from '@/shared/domain/calendar-date.js';

/** Why a stay is invalid (same rules as the backend, hotel calendar days). */
export const StayRuleError = Object.freeze({
    DATES_REQUIRED: 'datesRequired',
    CHECK_IN_IN_PAST: 'checkInInPast',
    CHECK_OUT_NOT_AFTER_CHECK_IN: 'checkOutNotAfterCheckIn',
});

/**
 * Value object for the nights of a stay: check-in and check-out are calendar days; the check-out day is not a night.
 */
export class StayPeriod {
    /**
     * @param {CalendarDate|string|null} checkIn
     * @param {CalendarDate|string|null} checkOut
     */
    constructor(checkIn, checkOut) {
        this.checkIn = CalendarDate.from(checkIn);
        this.checkOut = CalendarDate.from(checkOut);
        Object.freeze(this);
    }

    /**
     * @param {CalendarDate|string|Date|null} checkIn
     * @param {CalendarDate|string|Date|null} checkOut
     * @returns {StayPeriod}
     */
    static of(checkIn, checkOut) {
        return new StayPeriod(CalendarDate.from(checkIn), CalendarDate.from(checkOut));
    }

    /** @returns {boolean} */
    get isComplete() {
        return !!this.checkIn && !!this.checkOut;
    }

    /** @returns {number} Nights (0 when a date is missing or reversed). */
    get nights() {
        return this.isComplete ? Math.max(0, this.checkIn.daysUntil(this.checkOut)) : 0;
    }

    /**
     * US-51 scenario 4: check-in not in the past, check-out at least one day after check-in.
     * @param {CalendarDate} [today]
     * @returns {string|null} A {@link StayRuleError}, or null when valid.
     */
    validate(today = CalendarDate.today()) {
        if (!this.isComplete) return StayRuleError.DATES_REQUIRED;
        if (this.checkIn.isBefore(today)) return StayRuleError.CHECK_IN_IN_PAST;
        if (this.nights < 1) return StayRuleError.CHECK_OUT_NOT_AFTER_CHECK_IN;
        return null;
    }

    /**
     * @param {CalendarDate} day
     * @returns {boolean} True when `day` is one of the nights (check-in included, check-out excluded).
     */
    includesNight(day) {
        return this.isComplete && !day.isBefore(this.checkIn) && day.isBefore(this.checkOut);
    }

    /**
     * @param {StayPeriod|null} other
     * @returns {boolean}
     */
    equals(other) {
        return !!other && !!this.checkIn?.equals(other.checkIn) && !!this.checkOut?.equals(other.checkOut);
    }
}
