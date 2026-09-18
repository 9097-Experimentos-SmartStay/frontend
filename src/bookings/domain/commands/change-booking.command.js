import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { StayRuleError } from '../model/stay-period.js';

/** Why a change request is invalid before sending it. */
export const ChangeBookingRuleError = Object.freeze({
    NOTHING_CHANGED: 'nothingChanged',
});

/**
 * PATCH /bookings/{id} (US-07 scenario 3): new dates and/or another room of the same hotel. Availability is
 * validated again by the backend; a paid booking can only change to a stay with the same total.
 */
export class ChangeBookingCommand {
    /**
     * @param {Object} params
     * @param {import('../model/booking.entity.js').Booking} params.booking - The booking as it is now.
     * @param {import('../model/stay-period.js').StayPeriod} params.stay - The new stay (may be the same).
     * @param {number} params.roomId - The new room (may be the same).
     */
    constructor({ booking, stay, roomId }) {
        this.bookingId = booking.id;
        this.stay = stay;
        this.roomId = Number(roomId);
        this.datesChanged = !stay.equals(booking.stay);
        this.roomChanged = this.roomId !== booking.roomId;
        Object.freeze(this);
    }

    /**
     * @param {CalendarDate} [today]
     * @returns {string|null} A StayRuleError or {@link ChangeBookingRuleError}, or null when valid.
     */
    validate(today = CalendarDate.today()) {
        if (!this.datesChanged && !this.roomChanged) return ChangeBookingRuleError.NOTHING_CHANGED;
        if (this.datesChanged) return this.stay.validate(today);
        return this.stay.isComplete ? null : StayRuleError.DATES_REQUIRED;
    }
}
