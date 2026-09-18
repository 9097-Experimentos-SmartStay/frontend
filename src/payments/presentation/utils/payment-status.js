import { PaymentStatus } from '../../domain/model/payment.entity.js';

const SEVERITY = Object.freeze({
    [PaymentStatus.COMPLETED]: 'success',
    [PaymentStatus.FAILED]: 'danger',
    [PaymentStatus.REFUNDED]: 'secondary',
});

/**
 * @param {string} status
 * @returns {string} PrimeVue Tag severity.
 */
export function paymentStatusSeverity(status) {
    return SEVERITY[status] ?? 'secondary';
}

/**
 * @param {Function} t - vue-i18n `t`.
 * @param {string} status
 * @returns {string}
 */
export function paymentStatusLabel(t, status) {
    return SEVERITY[status] ? t(`paymentStatus.${status}`) : status;
}
