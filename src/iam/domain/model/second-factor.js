/**
 * Second factor of the staff accounts (US-52, contract §2.6): TOTP authenticator codes (RFC 6238, 6 digits,
 * 30-second steps) and single-use recovery codes ("XXXXX-XXXXX").
 */

/** Digits of an authenticator code. */
export const AUTHENTICATOR_CODE_LENGTH = 6;

/** Recovery codes the backend issues when the enrollment is confirmed. */
export const RECOVERY_CODE_COUNT = 10;

/** Why a second-factor input is invalid before sending it (codes mapped to `validation.<code>`). */
export const SecondFactorRuleError = Object.freeze({
    REQUIRED: 'required',
    AUTHENTICATOR_CODE_FORMAT: 'authenticatorCodeFormat',
    RECOVERY_CODE_FORMAT: 'recoveryCodeFormat',
});

const AUTHENTICATOR_CODE = /^\d{6}$/;
const RECOVERY_CODE = /^[A-Z0-9]{5}-[A-Z0-9]{5}$/;

/**
 * @param {string} value - What the user typed (spaces are ignored: apps show "492 039").
 * @returns {string}
 */
export function normalizeAuthenticatorCode(value) {
    return String(value ?? '').replace(/\s+/g, '');
}

/**
 * Recovery codes are case-insensitive and the hyphen is optional when typing ("k7m2q9trhx" → "K7M2Q-9TRHX").
 * @param {string} value
 * @returns {string}
 */
export function normalizeRecoveryCode(value) {
    const compact = String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return compact.length === 10 ? `${compact.slice(0, 5)}-${compact.slice(5)}` : compact;
}

/**
 * @param {string} value
 * @returns {{code: string}|null} A rule violation, or null when valid.
 */
export function validateAuthenticatorCode(value) {
    const code = normalizeAuthenticatorCode(value);
    if (!code) return { code: SecondFactorRuleError.REQUIRED };
    return AUTHENTICATOR_CODE.test(code) ? null : { code: SecondFactorRuleError.AUTHENTICATOR_CODE_FORMAT };
}

/**
 * @param {string} value
 * @returns {{code: string}|null}
 */
export function validateRecoveryCode(value) {
    const code = normalizeRecoveryCode(value);
    if (!code) return { code: SecondFactorRuleError.REQUIRED };
    return RECOVERY_CODE.test(code) ? null : { code: SecondFactorRuleError.RECOVERY_CODE_FORMAT };
}
