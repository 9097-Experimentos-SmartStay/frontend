/**
 * How a guest pays a booking outside the app (decision of the backlog round: no card form in the app).
 * Reception registers the payment with one of these methods.
 * The API strings are provisional until the backend publishes the contract (audit/09-frontend-gaps.md).
 */
export const PaymentMethod = Object.freeze({
    YAPE: 'Yape',
    PLIN: 'Plin',
    BANK_TRANSFER: 'BankTransfer',
    CASH: 'Cash',
    CARD_AT_RECEPTION: 'CardAtReception',
});

/**
 * @param {string} method
 * @returns {boolean} Every method except cash leaves an operation number to trace the payment.
 */
export function requiresOperationNumber(method) {
    return !!method && method !== PaymentMethod.CASH;
}

/** Methods the guest can use before arriving (shown in the payment instructions). */
export const REMOTE_PAYMENT_METHODS = Object.freeze([PaymentMethod.YAPE, PaymentMethod.PLIN, PaymentMethod.BANK_TRANSFER]);

/** Hours the guest has to pay a pending booking. */
export const PAYMENT_DEADLINE_HOURS = 24;
