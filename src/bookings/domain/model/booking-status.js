/**
 * Lifecycle of a booking (§8, D1): Pending → (payment registered by the hotel) → Confirmed → CheckedIn.
 * Cancelled by the guest, the hotel or the payment deadline. Completed is not reached yet.
 */
export const BookingStatus = Object.freeze({
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CHECKED_IN: 'CheckedIn',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
});

/** Why a booking was cancelled (`cancellationReason`). */
export const CancellationReason = Object.freeze({
    GUEST_REQUEST: 'GuestRequest',
    HOTEL_REQUEST: 'HotelRequest',
    /** Not paid before `paymentDueAt` (24 h): cancelled automatically — shown as "Vencida". */
    PAYMENT_NOT_RECEIVED: 'PaymentNotReceived',
});

/** Statuses that hold the room for their nights. */
export const ACTIVE_BOOKING_STATUSES = Object.freeze([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]);

/** Statuses that can still be cancelled or changed (§8.3, §8.4). */
export const CHANGEABLE_BOOKING_STATUSES = Object.freeze([BookingStatus.PENDING, BookingStatus.CONFIRMED]);
