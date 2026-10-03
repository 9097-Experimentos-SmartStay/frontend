import { PaymentFailureReason } from '../application/payment-failure.js';
import { OPERATION_NUMBER_MAX_LENGTH, PAYMENT_NOTE_MAX_LENGTH, RegisterPaymentRuleError } from '../domain/commands/register-payment.command.js';
import { CardPaymentRuleError } from '../domain/commands/pay-with-card.command.js';

/**
 * Anti-corruption layer for the errors of POST /bookings/{id}/payments (§9): stable problem and violation codes
 * → business reasons and rule codes of the form.
 */

/** Problem codes of the Payments context (§0 catalog) → business reason. */
const REASON_BY_CODE = Object.freeze({
    'payment.booking_already_paid': PaymentFailureReason.ALREADY_PAID,
    'payment.booking_not_pending': PaymentFailureReason.BOOKING_NOT_PENDING,
    'payment.card_declined': PaymentFailureReason.CARD_DECLINED,
});

/**
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {string|null}
 */
export function classifyPaymentProblem(problem) {
    return REASON_BY_CODE[problem.code] ?? null;
}

/**
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function paymentFieldViolations(problem) {
    const violations = {};
    if (problem.violationOf('method')) violations.method = { code: RegisterPaymentRuleError.METHOD_REQUIRED };
    if (problem.violationOf('operationNumber')) {
        violations.operationNumber = problem.fieldHas('operationNumber', 'payment.operation_number_too_long', 'field.length')
            ? { code: RegisterPaymentRuleError.OPERATION_NUMBER_TOO_LONG, params: { max: OPERATION_NUMBER_MAX_LENGTH } }
            : { code: RegisterPaymentRuleError.OPERATION_NUMBER_REQUIRED };
    }
    if (problem.violationOf('note')) violations.note = { code: RegisterPaymentRuleError.NOTE_TOO_LONG, params: { max: PAYMENT_NOTE_MAX_LENGTH } };
    return violations;
}

/**
 * Field violations of POST /bookings/{id}/payments/card (CardPaymentResource) → fields of the card form.
 * The API reports the expiry on `expiryMonth`/`expiryYear` (`field.invalid` when the card has expired); the form
 * has a single "MM/YY" field.
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function cardPaymentFieldViolations(problem) {
    const violations = {};
    if (problem.violationOf('cardNumber')) violations.cardNumber = { code: CardPaymentRuleError.NUMBER_INVALID };
    if (problem.violationOf('cardHolderName')) violations.holderName = { code: CardPaymentRuleError.HOLDER_REQUIRED };
    if (problem.violationOf('expiryMonth') || problem.violationOf('expiryYear')) {
        violations.expiry = problem.fieldHas('expiryMonth', 'field.invalid') || problem.fieldHas('expiryYear', 'field.invalid')
            ? { code: CardPaymentRuleError.EXPIRED }
            : { code: CardPaymentRuleError.EXPIRY_INVALID };
    }
    if (problem.violationOf('cvv')) violations.cvv = { code: CardPaymentRuleError.CVV_INVALID, params: { length: 3 } };
    return violations;
}
