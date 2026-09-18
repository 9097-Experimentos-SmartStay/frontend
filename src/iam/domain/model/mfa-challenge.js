/** What the password step asks for next (sign-in response of a staff account, §2.3). */
export const MfaChallengeKind = Object.freeze({
    /** First sign-in, or after an administrator reset: set up an authenticator app (US-52 scenario 1). */
    ENROLLMENT: 'enrollment',
    /** Authenticator already set up: enter a code or a recovery code (US-52 scenarios 2 and 3). */
    VERIFICATION: 'verification',
});

/**
 * The pending second step of a sign-in: the password was right, but no session exists yet.
 *
 * `token` is the short-lived `mfaToken` (10 minutes). It is NOT an access token: it only opens the
 * `/authentication/mfa/*` endpoints, so it lives in memory and is never stored or sent anywhere else.
 * `rememberMe` is the choice of the password step: the backend applies it when the second factor succeeds.
 */
export class MfaChallenge {
    /**
     * @param {Object} params
     * @param {string} params.kind - One of {@link MfaChallengeKind}.
     * @param {string} params.token
     * @param {Date|null} params.expiresAt
     * @param {string} params.email
     * @param {boolean} params.rememberMe
     */
    constructor({ kind, token, expiresAt, email, rememberMe }) {
        this.kind = kind;
        this.token = token;
        this.expiresAt = expiresAt;
        this.email = email;
        this.rememberMe = !!rememberMe;
        Object.freeze(this);
    }

    /** @returns {boolean} */
    get requiresEnrollment() {
        return this.kind === MfaChallengeKind.ENROLLMENT;
    }

    /**
     * @param {Date} [now]
     * @returns {boolean} True when the password step must be repeated.
     */
    isExpired(now = new Date()) {
        return !!this.expiresAt && this.expiresAt.getTime() <= now.getTime();
    }
}
