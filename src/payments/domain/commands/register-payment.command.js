import { PaymentMethod, requiresOperationNumber } from '../model/payment-method.js';

/** Why the registration form is invalid before sending it. */
export const RegisterPaymentRuleError = Object.freeze({
    METHOD_REQUIRED: 'methodRequired',
    OPERATION_NUMBER_REQUIRED: 'operationNumberRequired',
    OPERATION_NUMBER_TOO_LONG: 'operationNumberTooLong',
    NOTE_TOO_LONG: 'noteTooLong',
});

export const OPERATION_NUMBER_MAX_LENGTH = 50;
export const PAYMENT_NOTE_MAX_LENGTH = 300;

/**
 * Reception (or an administrator) registers the payment of a Pending booking (US-07 scenario 5,
 * POST /bookings/{id}/payments). There is no amount: it is always the booking total, and the booking
 * becomes Confirmed in the same transaction.
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
     * @returns {Record<string, {code: string, params?: Object}>} Violation per invalid field (empty when valid).
     */
    validate() {
        const errors = {};
        if (!Object.values(PaymentMethod).includes(this.method)) errors.method = { code: RegisterPaymentRuleError.METHOD_REQUIRED };
        if (requiresOperationNumber(this.method)) {
            if (!this.operationNumber) errors.operationNumber = { code: RegisterPaymentRuleError.OPERATION_NUMBER_REQUIRED };
            else if (this.operationNumber.length > OPERATION_NUMBER_MAX_LENGTH) {
                errors.operationNumber = { code: RegisterPaymentRuleError.OPERATION_NUMBER_TOO_LONG, params: { max: OPERATION_NUMBER_MAX_LENGTH } };
            }
        }
        if (this.note.length > PAYMENT_NOTE_MAX_LENGTH) errors.note = { code: RegisterPaymentRuleError.NOTE_TOO_LONG, params: { max: PAYMENT_NOTE_MAX_LENGTH } };
        return errors;
    }
}
