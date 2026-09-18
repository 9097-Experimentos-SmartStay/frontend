import { PaymentStatus } from '../../domain/model/payment.entity.js';

/**
 * @param {string} status
 * @returns {string} PrimeVue Tag severity.
 */
export function paymentStatusSeverity(status) {
    if (status === PaymentStatus.COMPLETED) return 'success';
    if (status === PaymentStatus.FAILED) return 'danger';
    return 'secondary';
}

/**
 * @param {Function} t - vue-i18n `t`.
 * @param {string} status
 * @returns {string}
 */
export function paymentStatusLabel(t, status) {
    if (status === PaymentStatus.COMPLETED) return t('payments.completed');
    if (status === PaymentStatus.FAILED) return t('payments.failed');
    return status;
}
