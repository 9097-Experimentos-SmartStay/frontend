/**
 * How a guest pays a booking outside the app (§9, D1: no card data in the app). The hotel registers the payment
 * with one of these methods and that confirms the booking.
 */
export const PaymentMethod = Object.freeze({
    YAPE: 'Yape',
    PLIN: 'Plin',
    BANK_TRANSFER: 'BankTransfer',
    CASH: 'Cash',
    CARD_AT_FRONT_DESK: 'CardAtFrontDesk',
});

/**
 * @param {string} method
 * @returns {boolean} Every method except cash leaves an operation number to trace the payment.
 */
export function requiresOperationNumber(method) {
    return !!method && method !== PaymentMethod.CASH;
}

/** Methods the guest can use before arriving (shown in the payment instructions, US-51 scenario 2). */
export const REMOTE_PAYMENT_METHODS = Object.freeze([PaymentMethod.YAPE, PaymentMethod.PLIN, PaymentMethod.BANK_TRANSFER]);
