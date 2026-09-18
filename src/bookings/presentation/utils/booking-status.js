import { BookingStatus } from '../../domain/model/booking.entity.js';

const SEVERITY = Object.freeze({
    [BookingStatus.PENDING]: 'warn',
    [BookingStatus.CONFIRMED]: 'success',
    [BookingStatus.CANCELLED]: 'danger',
    [BookingStatus.COMPLETED]: 'info',
});

const LABEL_KEY = Object.freeze({
    [BookingStatus.PENDING]: 'bookings.statusPending',
    [BookingStatus.CONFIRMED]: 'bookings.statusConfirmed',
    [BookingStatus.CANCELLED]: 'bookings.statusCancelled',
    [BookingStatus.COMPLETED]: 'bookings.statusCompleted',
});

/**
 * @param {string} status
 * @returns {string} PrimeVue Tag severity.
 */
export function bookingStatusSeverity(status) {
    return SEVERITY[status] ?? 'secondary';
}

/**
 * @param {Function} t - vue-i18n `t`.
 * @param {string} status
 * @returns {string}
 */
export function bookingStatusLabel(t, status) {
    return LABEL_KEY[status] ? t(LABEL_KEY[status]) : status;
}
