import { CalendarDate } from '@/shared/domain/calendar-date.js';

/** Booking status strings of the API (§8). `Completed` is not reached yet. */
export const BookingStatus = Object.freeze({
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
});

/**
 * Booking Domain Entity.
 * Check-in and check-out are CALENDAR DAYS ({@link CalendarDate}): the backend drops the time of day.
 * @class
 */
export class Booking {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {number} params.roomId
     * @param {string} params.guestName
     * @param {string} params.guestEmail
     * @param {CalendarDate|null} params.checkInDate
     * @param {CalendarDate|null} params.checkOutDate
     * @param {string} [params.status='Pending'] - One of {@link BookingStatus}.
     * @param {number|null} [params.userId] - Guest account that owns the booking (null for desk bookings).
     * @param {string|null} [params.guestProfileId]
     */
    constructor({ id, roomId, guestName, guestEmail, checkInDate, checkOutDate, status, userId = null, guestProfileId = null }) {
        this.id = id;
        this.roomId = roomId;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.checkInDate = CalendarDate.from(checkInDate);
        this.checkOutDate = CalendarDate.from(checkOutDate);
        this.status = status || BookingStatus.PENDING;
        this.userId = userId;
        this.guestProfileId = guestProfileId;
    }

    /** @returns {number} Nights between check-in and check-out (the unit the backend charges). */
    get nights() {
        if (!this.checkInDate || !this.checkOutDate) return 0;
        return Math.max(0, this.checkInDate.daysUntil(this.checkOutDate));
    }

    /** @returns {boolean} */
    isPending() {
        return this.status === BookingStatus.PENDING;
    }

    /** @returns {boolean} */
    isConfirmed() {
        return this.status === BookingStatus.CONFIRMED;
    }

    /** @returns {boolean} */
    isCancelled() {
        return this.status === BookingStatus.CANCELLED;
    }

    /** @returns {boolean} */
    isCompleted() {
        return this.status === BookingStatus.COMPLETED;
    }

    /** @returns {boolean} Pending or Confirmed: it holds the room. */
    isActive() {
        return this.isPending() || this.isConfirmed();
    }

    /** @returns {boolean} The backend lets the guest (or reception) cancel it (409 once completed). */
    canBeCancelled() {
        return this.isActive();
    }

    /** @returns {boolean} Payment is possible while the booking is pending (a paid booking becomes Confirmed). */
    canBePaid() {
        return this.isPending();
    }

    /**
     * @param {CalendarDate} [today]
     * @returns {boolean} Active and not finished yet (check-out today or later).
     */
    isUpcoming(today = CalendarDate.today()) {
        return this.isActive() && !!this.checkOutDate && !this.checkOutDate.isBefore(today);
    }

    /**
     * @param {string} status
     * @returns {Booking} A copy with another status.
     */
    withStatus(status) {
        return new Booking({ ...this, status });
    }
}
