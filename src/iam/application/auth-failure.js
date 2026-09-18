import { ProblemDetails } from '@/shared/infrastructure/http/problem-details.js';

/** Why an account operation failed, in business terms (the views map each reason to a message). */
export const AuthFailureReason = Object.freeze({
    INVALID_CREDENTIALS: 'invalidCredentials',
    ACCOUNT_LOCKED: 'accountLocked',
    ACCOUNT_DEACTIVATED: 'accountDeactivated',
    EMAIL_NOT_VERIFIED: 'emailNotVerified',
    EMAIL_ALREADY_REGISTERED: 'emailAlreadyRegistered',
    LINK_EXPIRED: 'linkExpired',
    LINK_INVALID: 'linkInvalid',
    INVALID_DATA: 'invalidData',
    FORBIDDEN: 'forbidden',
    CONFLICT: 'conflict',
    NOT_FOUND: 'notFound',
    RATE_LIMITED: 'rateLimited',
    NETWORK: 'network',
    SERVER: 'server',
    UNEXPECTED: 'unexpected',
});

/**
 * Error thrown by the IAM stores. It carries the business reason plus the data a view needs
 * (lock end, retry delay, invalid fields), so views never inspect HTTP statuses or English `detail`s.
 */
export class AuthFailure extends Error {
    /**
     * @param {string} reason - One of {@link AuthFailureReason}.
     * @param {ProblemDetails} problem
     */
    constructor(reason, problem) {
        super(reason);
        this.name = 'AuthFailure';
        this.reason = reason;
        this.problem = problem;
    }

    /** @returns {Date|null} End of the temporary lock (US-02 scenario 3). */
    get lockedUntil() {
        const value = this.problem.extensions.lockedUntil;
        return value ? new Date(value) : null;
    }

    /** @returns {number|null} Seconds to wait after a 429. */
    get retryAfterSeconds() {
        return this.problem.retryAfterSeconds;
    }

    /** @returns {Record<string, string[]>} Invalid fields reported by the API (camelCase keys). */
    get fieldErrors() {
        return this.problem.fieldErrors;
    }

    /**
     * Translates an HTTP error into an AuthFailure.
     * @param {unknown} error
     * @param {Record<number, string>} [reasonByStatus] - Use-case specific meaning of some statuses.
     * @returns {AuthFailure}
     */
    static from(error, reasonByStatus = {}) {
        if (error instanceof AuthFailure) return error;
        const problem = ProblemDetails.fromError(error);
        return new AuthFailure(reasonFor(problem, reasonByStatus), problem);
    }
}

function reasonFor(problem, reasonByStatus) {
    const { status } = problem;
    if (!status) return problem.isNetworkError ? AuthFailureReason.NETWORK : AuthFailureReason.UNEXPECTED;
    if (reasonByStatus[status]) return reasonByStatus[status];
    if (status === 400) return AuthFailureReason.INVALID_DATA;
    if (status === 403) return AuthFailureReason.FORBIDDEN;
    if (status === 404) return AuthFailureReason.NOT_FOUND;
    if (status === 409) return AuthFailureReason.CONFLICT;
    if (status === 429) return AuthFailureReason.RATE_LIMITED;
    if (status >= 500) return AuthFailureReason.SERVER;
    return AuthFailureReason.UNEXPECTED;
}
