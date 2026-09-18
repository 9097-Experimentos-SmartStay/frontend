import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { Money } from '@/shared/domain/money.js';
import { BookingStatus, CancellationReason, CHANGEABLE_BOOKING_STATUSES, ACTIVE_BOOKING_STATUSES } from './booking-status.js';
import { StayPeriod } from './stay-period.js';

export { BookingStatus, CancellationReason };

/** Why a booking cannot be cancelled now (§8.4). */
export const CancellationBlock = Object.freeze({
    /** Only Pending or Confirmed bookings can be cancelled. */
    STATUS: 'status',
    /** Not on or after the check-in day (hotel calendar). */
    CHECK_IN_DAY_REACHED: 'checkInDayReached',
});

/**
 * A booking (BookingResource, §8): who stays in which room, which nights, for how much and in which state.
 *
 * - `pricePerNight` and `total` are the snapshot taken when it was made: a later room price change does not
 *   touch them, and a registered payment is always `total`.
 * - A Pending booking holds the room until `paymentDueAt` (24 h); unpaid, it is cancelled automatically
 *   (reason PaymentNotReceived, shown as "Vencida").
 */
export class Booking {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {import('./booking-code.js').BookingCode|null} params.code
     * @param {number|null} params.hotelId
     * @param {number} params.roomId
     * @param {string|null} params.roomNumber - The number people see (US-53).
     * @param {string} params.guestName
     * @param {string} params.guestEmail
     * @param {string|null} [params.guestPhone]
     * @param {StayPeriod} params.stay
     * @param {Money|null} [params.pricePerNight]
     * @param {Money|null} [params.total]
     * @param {string} params.status - One of {@link BookingStatus}.
     * @param {Date|null} [params.createdAt]
     * @param {Date|null} [params.paymentDueAt]
     * @param {Date|null} [params.confirmedAt] - Set when the payment was registered.
     * @param {Date|null} [params.cancelledAt]
     * @param {string|null} [params.cancellationReason] - One of {@link CancellationReason}.
     * @param {number|null} [params.userId] - Guest account (null for a desk booking of a guest without account).
     * @param {import('./payment-instructions.js').PaymentInstructions|null} [params.paymentInstructions] - The
     *   hotel's payment methods; only for a Pending booking read by id or just created.
     */
    constructor({
        id, code = null, hotelId = null, roomId, roomNumber = null, guestName, guestEmail, guestPhone = null, stay,
        pricePerNight = null, total = null, status, createdAt = null, paymentDueAt = null, confirmedAt = null,
        cancelledAt = null, cancellationReason = null, userId = null, paymentInstructions = null,
    }) {
        this.id = id;
        this.code = code;
        this.hotelId = hotelId;
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.guestName = guestName ?? '';
        this.guestEmail = guestEmail ?? '';
        this.guestPhone = guestPhone;
        this.stay = stay ?? new StayPeriod(null, null);
        this.pricePerNight = pricePerNight;
        this.total = total ?? (pricePerNight ? pricePerNight.times(this.stay.nights) : null);
        this.status = status || BookingStatus.PENDING;
        this.createdAt = createdAt;
        this.paymentDueAt = paymentDueAt;
        this.confirmedAt = confirmedAt;
        this.cancelledAt = cancelledAt;
        this.cancellationReason = cancellationReason;
        this.userId = userId;
        this.paymentInstructions = paymentInstructions;
        Object.freeze(this);
    }

    /** @returns {CalendarDate|null} */
    get checkInDate() {
        return this.stay.checkIn;
    }

    /** @returns {CalendarDate|null} */
    get checkOutDate() {
        return this.stay.checkOut;
    }

    /** @returns {number} */
    get nights() {
        return this.stay.nights;
    }

    /** @returns {string} The booking code, or "#id" for data without one. */
    get reference() {
        return this.code?.value ?? `#${this.id}`;
    }

    /** @returns {string} The room number; "#roomId" only while the API does not send it. */
    get roomLabel() {
        return this.roomNumber ?? `#${this.roomId}`;
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

    /** @returns {boolean} Pending, Confirmed or CheckedIn: it holds the room. */
    isActive() {
        return ACTIVE_BOOKING_STATUSES.includes(this.status);
    }

    /** @returns {boolean} Cancelled automatically because nobody paid before the deadline. */
    get isExpired() {
        return this.isCancelled() && this.cancellationReason === CancellationReason.PAYMENT_NOT_RECEIVED;
    }

    /** @returns {boolean} A payment was registered at some point (confirmedAt is set). */
    get wasPaid() {
        return !!this.confirmedAt;
    }

    /** @returns {boolean} Cancelled after being paid: its payment was marked Refunded (§8.4). */
    get isRefunded() {
        return this.isCancelled() && this.wasPaid;
    }

    /**
     * Cancellation policy (§8.4, US-07 scenario 4): only Pending or Confirmed, and before the check-in day.
     * @param {CalendarDate} [today] - Today in the hotel calendar.
     * @returns {string|null} A {@link CancellationBlock}, or null when it can be cancelled.
     */
    cancellationBlock(today = CalendarDate.today()) {
        if (!CHANGEABLE_BOOKING_STATUSES.includes(this.status)) return CancellationBlock.STATUS;
        if (this.checkInDate && !today.isBefore(this.checkInDate)) return CancellationBlock.CHECK_IN_DAY_REACHED;
        return null;
    }

    /**
     * @param {CalendarDate} [today]
     * @returns {boolean}
     */
    canBeCancelled(today = CalendarDate.today()) {
        return this.cancellationBlock(today) === null;
    }

    /**
     * Only Pending or Confirmed bookings can change dates or room (§8.3); the new dates are validated apart.
     * @returns {boolean}
     */
    canBeChanged() {
        return CHANGEABLE_BOOKING_STATUSES.includes(this.status);
    }

    /** @returns {boolean} Payment is registered while the booking is Pending (the payment confirms it). */
    canBePaid() {
        return this.isPending();
    }

    /**
     * @param {Date} [now]
     * @returns {number|null} Milliseconds left to pay a Pending booking (≤ 0 when the deadline passed).
     */
    paymentTimeLeft(now = new Date()) {
        if (!this.isPending() || !this.paymentDueAt) return null;
        return this.paymentDueAt.getTime() - now.getTime();
    }

    /**
     * @param {CalendarDate} [today]
     * @returns {boolean} Active and not finished yet (check-out today or later).
     */
    isUpcoming(today = CalendarDate.today()) {
        return this.isActive() && !!this.checkOutDate && !this.checkOutDate.isBefore(today);
    }
}
