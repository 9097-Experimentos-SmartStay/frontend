import { BookingStatus, CancellationBlock, CancellationReason } from '../../domain/model/booking.entity.js';

const SEVERITY = Object.freeze({
    [BookingStatus.PENDING]: 'warn',
    [BookingStatus.CONFIRMED]: 'success',
    [BookingStatus.CHECKED_IN]: 'info',
    [BookingStatus.CANCELLED]: 'danger',
    [BookingStatus.COMPLETED]: 'secondary',
});

/**
 * @param {string} status
 * @returns {string} PrimeVue Tag severity (Pending = waiting for payment).
 */
export function bookingStatusSeverity(status) {
    return SEVERITY[status] ?? 'secondary';
}

/**
 * @param {Function} t - vue-i18n `t`.
 * @param {string} status
 * @returns {string} "Pendiente de pago", "Confirmada"...
 */
export function bookingStatusLabel(t, status) {
    return SEVERITY[status] ? t(`bookingStatus.${status}`) : status;
}

/**
 * Badge of a booking, including the variants of a cancellation: "Vencida" (not paid in time) and
 * "Cancelada · reembolsada" (it had been paid, §8.4).
 * @param {Function} t
 * @param {import('../../domain/model/booking.entity.js').Booking} booking
 * @returns {{label: string, severity: string}}
 */
export function bookingBadge(t, booking) {
    if (booking.isExpired) return { label: t('bookingStatus.Expired'), severity: 'secondary' };
    if (booking.isRefunded) return { label: t('bookingStatus.Refunded'), severity: 'danger' };
    return { label: bookingStatusLabel(t, booking.status), severity: bookingStatusSeverity(booking.status) };
}

/**
 * @param {Function} t
 * @param {import('../../domain/model/booking.entity.js').Booking} booking
 * @returns {string} Why a cancelled booking was cancelled ('' when it is not cancelled).
 */
export function cancellationReasonText(t, booking) {
    if (!booking.isCancelled() || !booking.cancellationReason) return '';
    return Object.values(CancellationReason).includes(booking.cancellationReason)
        ? t(`bookingCancellation.reasons.${booking.cancellationReason}`)
        : booking.cancellationReason;
}

/**
 * Explanation of the cancellation policy for a booking that cannot be cancelled now (§8.4).
 * @param {Function} t
 * @param {import('../../domain/model/booking.entity.js').Booking} booking
 * @param {string} locale
 * @returns {string} '' when it can be cancelled.
 */
export function cancellationBlockText(t, booking, locale) {
    const block = booking.cancellationBlock();
    if (block === CancellationBlock.CHECK_IN_DAY_REACHED) {
        return t('bookingCancellation.checkInDayReached', { date: booking.checkInDate.format(locale, { day: 'numeric', month: 'long' }) });
    }
    if (block === CancellationBlock.STATUS) return t('bookingCancellation.notCancellable');
    return '';
}
