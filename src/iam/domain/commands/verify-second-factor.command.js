import {
    normalizeAuthenticatorCode,
    normalizeRecoveryCode,
    validateAuthenticatorCode,
    validateRecoveryCode,
} from '../model/second-factor.js';

/** Which second factor the user presents (US-52 scenarios 2 and 3). */
export const SecondFactorMethod = Object.freeze({
    AUTHENTICATOR_CODE: 'authenticatorCode',
    RECOVERY_CODE: 'recoveryCode',
});

/**
 * Second step of a sign-in: exactly one of an authenticator code or a recovery code.
 */
export class VerifySecondFactorCommand {
    /**
     * @param {Object} params
     * @param {string} params.method - One of {@link SecondFactorMethod}.
     * @param {string} params.value - The code as typed.
     */
    constructor({ method, value }) {
        this.method = method;
        this.value = method === SecondFactorMethod.RECOVERY_CODE
            ? normalizeRecoveryCode(value)
            : normalizeAuthenticatorCode(value);
        Object.freeze(this);
    }

    /** @returns {boolean} */
    get usesRecoveryCode() {
        return this.method === SecondFactorMethod.RECOVERY_CODE;
    }

    /** @returns {{code: string}|null} A rule violation, or null when valid. */
    validate() {
        return this.usesRecoveryCode ? validateRecoveryCode(this.value) : validateAuthenticatorCode(this.value);
    }
}

/**
 * Confirms the authenticator app with its first code (US-52 scenario 1).
 */
export class ConfirmMfaEnrollmentCommand {
    /**
     * @param {Object} params
     * @param {string} params.code
     */
    constructor({ code }) {
        this.code = normalizeAuthenticatorCode(code);
        Object.freeze(this);
    }

    /** @returns {{code: string}|null} */
    validate() {
        return validateAuthenticatorCode(this.code);
    }
}
