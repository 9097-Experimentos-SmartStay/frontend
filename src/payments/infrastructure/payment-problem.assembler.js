import { PaymentFailureReason } from '../application/payment-failure.js';
import { RegisterPaymentRuleError } from '../domain/commands/register-payment.command.js';

/**
 * Anti-corruption layer for the errors of POST /bookings/{id}/payments (§9).
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {string|null}
 */
export function classifyPaymentProblem(problem) {
    if (problem.status !== 409) return null;
    if (problem.detailIncludes('already paid')) return PaymentFailureReason.ALREADY_PAID;
    if (problem.detailIncludes('only a pending booking')) return PaymentFailureReason.BOOKING_NOT_PENDING;
    return null;
}

/**
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function paymentFieldViolations(problem) {
    const violations = {};
    if (problem.fieldErrors.method) violations.method = { code: RegisterPaymentRuleError.METHOD_REQUIRED };
    if (problem.fieldErrors.operationNumber) {
        const tooLong = /50|at most|maximum/i.test(problem.fieldErrors.operationNumber.join(' '));
        violations.operationNumber = tooLong
            ? { code: RegisterPaymentRuleError.OPERATION_NUMBER_TOO_LONG, params: { max: 50 } }
            : { code: RegisterPaymentRuleError.OPERATION_NUMBER_REQUIRED };
    }
    if (problem.fieldErrors.note) violations.note = { code: RegisterPaymentRuleError.NOTE_TOO_LONG, params: { max: 300 } };
    return violations;
}
