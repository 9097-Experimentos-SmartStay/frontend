import { ProblemDetails } from '@/shared/infrastructure/http/problem-details.js';

/** Reasons every use case can fail for; each bounded context adds its own business reasons. */
export const FailureReason = Object.freeze({
    INVALID_DATA: 'invalidData',
    FORBIDDEN: 'forbidden',
    NOT_FOUND: 'notFound',
    CONFLICT: 'conflict',
    RATE_LIMITED: 'rateLimited',
    NETWORK: 'network',
    SERVER: 'server',
    UNEXPECTED: 'unexpected',
});

/**
 * Error thrown by the stores of the business contexts (accommodations, bookings, payments).
 *
 * It carries a business `reason` (what went wrong for the use case) plus the invalid fields the API reported,
 * so views map reasons to messages and never read HTTP statuses or the English `detail`.
 * Contexts classify their own conflicts (e.g. "room no longer available") with {@link OperationFailure.from}.
 */
export class OperationFailure extends Error {
    /**
     * @param {string} reason - A {@link FailureReason} or a context-specific reason.
     * @param {ProblemDetails} problem
     * @param {Record<string, {code: string, params?: Object}>} [fieldViolations] - Rule broken per form field.
     */
    constructor(reason, problem, fieldViolations = {}) {
        super(reason);
        this.name = 'OperationFailure';
        this.reason = reason;
        this.problem = problem;
        this.fieldViolations = fieldViolations;
    }

    /** @returns {boolean} */
    get hasFieldViolations() {
        return Object.keys(this.fieldViolations).length > 0;
    }

    /**
     * @param {unknown} error - Usually an AxiosError.
     * @param {Object} [options]
     * @param {(problem: ProblemDetails) => string|null} [options.classify] - Business reason of the problem, or null
     *   to fall back to the generic reason of its status.
     * @param {(problem: ProblemDetails) => Record<string, {code: string, params?: Object}>} [options.fields] - Maps the
     *   API field errors (and field-like conflicts) to rule violations of the form.
     * @returns {OperationFailure}
     */
    static from(error, { classify = () => null, fields = () => ({}) } = {}) {
        if (error instanceof OperationFailure) return error;
        const problem = ProblemDetails.fromError(error);
        return new OperationFailure(classify(problem) ?? genericReason(problem), problem, fields(problem));
    }
}

function genericReason(problem) {
    const { status } = problem;
    if (!status) return problem.isNetworkError ? FailureReason.NETWORK : FailureReason.UNEXPECTED;
    if (status === 400) return FailureReason.INVALID_DATA;
    if (status === 403) return FailureReason.FORBIDDEN;
    if (status === 404) return FailureReason.NOT_FOUND;
    if (status === 409) return FailureReason.CONFLICT;
    if (status === 429) return FailureReason.RATE_LIMITED;
    if (status >= 500) return FailureReason.SERVER;
    return FailureReason.UNEXPECTED;
}
