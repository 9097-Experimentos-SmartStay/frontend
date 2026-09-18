import { CalendarDate } from '@/shared/domain/calendar-date.js';

/** Why a booking request is invalid before sending it (same rules as the backend, §8). */
export const BookingRuleError = Object.freeze({
    ROOM_REQUIRED: 'roomRequired',
    DATES_REQUIRED: 'datesRequired',
    CHECK_IN_IN_PAST: 'checkInInPast',
    CHECK_OUT_NOT_AFTER_CHECK_IN: 'checkOutNotAfterCheckIn',
});

/**
 * A guest books a room for some nights (POST /bookings).
 */
export class CreateBookingCommand {
    /**
     * @param {Object} params
     * @param {number} params.roomId
     * @param {CalendarDate|string} params.checkInDate
     * @param {CalendarDate|string} params.checkOutDate
     * @param {string} [params.guestName] - Optional: the backend falls back to the account e-mail.
     * @param {string} [params.guestEmail]
     */
    constructor({ roomId, checkInDate, checkOutDate, guestName = '', guestEmail = '' }) {
        this.roomId = roomId ? Number(roomId) : null;
        this.checkInDate = CalendarDate.from(checkInDate);
        this.checkOutDate = CalendarDate.from(checkOutDate);
        this.guestName = guestName?.trim() ?? '';
        this.guestEmail = guestEmail?.trim() ?? '';
        Object.freeze(this);
    }

    /** @returns {number} Nights requested (0 when the dates are missing or reversed). */
    get nights() {
        if (!this.checkInDate || !this.checkOutDate) return 0;
        return Math.max(0, this.checkInDate.daysUntil(this.checkOutDate));
    }

    /**
     * @param {CalendarDate} [today]
     * @returns {string|null} A {@link BookingRuleError}, or null when the request is valid.
     */
    validate(today = CalendarDate.today()) {
        if (!this.roomId) return BookingRuleError.ROOM_REQUIRED;
        if (!this.checkInDate || !this.checkOutDate) return BookingRuleError.DATES_REQUIRED;
        if (this.checkInDate.isBefore(today)) return BookingRuleError.CHECK_IN_IN_PAST;
        if (this.nights < 1) return BookingRuleError.CHECK_OUT_NOT_AFTER_CHECK_IN;
        return null;
    }
}
