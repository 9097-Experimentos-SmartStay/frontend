import { CalendarDate } from '@/shared/domain/calendar-date.js';

/** Why a booking request is invalid before sending it (same rules as the backend, §8.1). */
export const BookingRuleError = Object.freeze({
    REQUIRED: 'required',
    ROOM_REQUIRED: 'roomRequired',
    GUEST_NAME: 'guestName',
    GUEST_EMAIL: 'guestEmail',
    GUEST_PHONE: 'guestPhone',
});

const GUEST_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_DIGITS = /^\+?\d{7,15}$/;

/**
 * Contact of a guest booked by the hotel staff by phone or at the desk (US-07 scenario 2). The guest does not
 * need an account: the booking keeps this snapshot and the booking e-mails go to `email`.
 */
export class GuestContact {
    /**
     * @param {Object} params
     * @param {string} params.name
     * @param {string} params.email
     * @param {string} [params.phone] - Optional; spaces, dots, dashes and parentheses are ignored.
     */
    constructor({ name, email, phone = '' }) {
        this.name = (name ?? '').trim();
        this.email = (email ?? '').trim().toLowerCase();
        this.phone = (phone ?? '').replace(/[\s.\-()]/g, '');
        Object.freeze(this);
    }

    /** @returns {Record<string, {code: string}>} Violation per invalid field (keys of the API body). */
    validate() {
        const errors = {};
        if (this.name.length < 2 || this.name.length > 100) errors.guestName = { code: BookingRuleError.GUEST_NAME };
        if (!GUEST_EMAIL.test(this.email) || this.email.length > 254) errors.guestEmail = { code: BookingRuleError.GUEST_EMAIL };
        if (this.phone && !PHONE_DIGITS.test(this.phone)) errors.guestPhone = { code: BookingRuleError.GUEST_PHONE };
        return errors;
    }
}

/**
 * POST /bookings (§8.1): a guest books a room for themselves (US-51), or reception/admin books it for a
 * guest without an account (US-07 scenario 2, with `guest`). The booking is born Pending (awaiting payment).
 */
export class CreateBookingCommand {
    /**
     * @param {Object} params
     * @param {number} params.roomId
     * @param {import('../model/stay-period.js').StayPeriod} params.stay
     * @param {GuestContact|null} [params.guest] - Only for bookings made by the staff.
     */
    constructor({ roomId, stay, guest = null }) {
        this.roomId = roomId ? Number(roomId) : null;
        this.stay = stay;
        this.guest = guest;
        Object.freeze(this);
    }

    /**
     * @param {CalendarDate} [today]
     * @returns {Record<string, {code: string}>} Violation per invalid field (empty when valid).
     */
    validate(today = CalendarDate.today()) {
        const errors = { ...(this.guest?.validate() ?? {}) };
        const stayRule = this.stay.validate(today);
        if (stayRule) errors.stay = { code: stayRule };
        if (!this.roomId) errors.roomId = { code: BookingRuleError.ROOM_REQUIRED };
        return errors;
    }
}
