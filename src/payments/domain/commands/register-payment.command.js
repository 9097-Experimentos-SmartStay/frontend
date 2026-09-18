import { PaymentMethod, requiresOperationNumber } from '../model/payment-method.js';

/** Why the registration form is invalid before sending it. */
export const RegisterPaymentRuleError = Object.freeze({
    METHOD_REQUIRED: 'methodRequired',
    OPERATION_NUMBER_REQUIRED: 'operationNumberRequired',
    NOTE_TOO_LONG: 'noteTooLong',
});

export const PAYMENT_NOTE_MAX_LENGTH = 500;

/**
 * Reception (or an administrator) registers the payment of a booking. There is no amount:
 * the backend computes it (room price per night × nights) and the booking becomes Confirmed.
 */
export class RegisterPaymentCommand {
    /**
     * @param {Object} params
     * @param {number} params.bookingId
     * @param {string} params.method - One of {@link PaymentMethod}.
     * @param {string} [params.operationNumber] - Required except for cash.
     * @param {string} [params.note]
     */
    constructor({ bookingId, method, operationNumber = '', note = '' }) {
        this.bookingId = Number(bookingId);
        this.method = method;
        this.operationNumber = requiresOperationNumber(method) ? (operationNumber ?? '').trim() : '';
        this.note = (note ?? '').trim();
        Object.freeze(this);
    }

    /**
     * @returns {Record<string, string>} {@link RegisterPaymentRuleError} per invalid field (empty when valid).
     */
    validate() {
        const errors = {};
        if (!Object.values(PaymentMethod).includes(this.method)) errors.method = RegisterPaymentRuleError.METHOD_REQUIRED;
        if (requiresOperationNumber(this.method) && !this.operationNumber) {
            errors.operationNumber = RegisterPaymentRuleError.OPERATION_NUMBER_REQUIRED;
        }
        if (this.note.length > PAYMENT_NOTE_MAX_LENGTH) errors.note = RegisterPaymentRuleError.NOTE_TOO_LONG;
        return errors;
    }
}
