import { UserRole } from '../user-role.js';

/**
 * Password policy (NIST SP 800-63B-4, decision in audit/08-plan-backlog.md), in ONE place.
 *
 * - Length is the only local rule: guests (no MFA) need at least 15 characters (passphrases, spaces and
 *   Unicode welcome); staff roles (MFA TOTP) at least 8. Everyone at most 128.
 * - NO composition rules (no "one uppercase, one symbol"...).
 * - Context rules the client can check too, with the same algorithm as the backend (§2.0): not a repeated or
 *   sequential run ("aaaaaaaa", "12345678", "abcabcabc") and not the account e-mail or its user name.
 * - Common and breached passwords (blocklist + Have I Been Pwned) are checked only by the backend
 *   (400 with a field error on the password); the form shows that error under the input.
 *
 * The backend applies the same policy (§2.0). To change it here, change only this file.
 */
export const PASSWORD_MAX_LENGTH = 128;

const MIN_LENGTH_BY_AUDIENCE = Object.freeze({
    guest: 15,
    staff: 8,
});

/**
 * @typedef {Object} PasswordRequirements
 * @property {number} minLength
 * @property {number} maxLength
 */

/**
 * @param {string|null} role - Role of the account whose password is being set.
 *   Null when unknown (e.g. the reset link only carries a token): the lowest minimum applies and the
 *   backend, which knows the account, has the last word.
 * @returns {PasswordRequirements}
 */
export function passwordRequirementsFor(role) {
    const minLength = role === UserRole.GUEST
        ? MIN_LENGTH_BY_AUDIENCE.guest
        : MIN_LENGTH_BY_AUDIENCE.staff;
    return Object.freeze({ minLength, maxLength: PASSWORD_MAX_LENGTH });
}

/**
 * Length is counted in Unicode code points ("ñ" or an emoji is one character), not UTF-16 units.
 * @param {string} value
 * @returns {number}
 */
export function passwordLength(value) {
    return value ? [...value].length : 0;
}

/** Rules a new password can break (the messages live in i18n `validation.<code>`). */
export const PasswordPolicyRule = Object.freeze({
    TOO_SHORT: 'passwordTooShort',
    TOO_LONG: 'passwordTooLong',
    REPEATED_OR_SEQUENTIAL: 'passwordSequential',
    EMAIL_BASED: 'passwordEmailBased',
    /** Backend only: embedded blocklist of common passwords or the service name. */
    COMMON: 'passwordCommon',
    /** Backend only: found in a known breach (Have I Been Pwned, k-anonymity). */
    BREACHED: 'passwordBreached',
});

/** NFKC and case folding, like the backend before comparing. */
function fold(value) {
    return (value ?? '').normalize('NFKC').toLowerCase();
}

/**
 * Same algorithm as the backend: one character repeated, an ascending or descending run of code points,
 * or a short block repeated to fill the whole password ("abcabcabc", "12121212").
 * @param {string} value
 * @returns {boolean}
 */
export function isRepeatedOrSequential(value) {
    const points = [...fold(value)].map((char) => char.codePointAt(0));
    if (points.length < 2) return false;
    if (points.every((point) => point === points[0])) return true;

    let ascending = true;
    let descending = true;
    for (let i = 1; i < points.length; i++) {
        ascending &&= points[i] === points[i - 1] + 1;
        descending &&= points[i] === points[i - 1] - 1;
    }
    if (ascending || descending) return true;

    for (let block = 2; block <= points.length / 2; block++) {
        if (points.length % block !== 0) continue;
        if (points.every((point, i) => point === points[i % block])) return true;
    }
    return false;
}

/**
 * The password is the e-mail, its user name, or the user name with symbols removed.
 * @param {string} value
 * @param {string|null} email
 * @returns {boolean}
 */
export function isDerivedFromEmail(value, email) {
    if (!email) return false;
    const folded = fold(value);
    const address = fold(email).trim();
    const localPart = address.split('@')[0];
    const lettersAndDigits = (text) => [...text].filter((char) => /[\p{L}\p{N}]/u.test(char)).join('');
    return folded === address || folded === localPart || lettersAndDigits(folded) === lettersAndDigits(localPart);
}

/**
 * Rules the client can check before sending the password (everything except common/breached).
 * @param {string} value
 * @param {PasswordRequirements} requirements
 * @param {string|null} [email] - E-mail of the account whose password is set, when known.
 * @returns {{code: string, params?: Record<string, unknown>}|null} The first broken rule, or null.
 */
export function checkPasswordPolicy(value, requirements, email = null) {
    const length = passwordLength(value);
    if (length < requirements.minLength) return { code: PasswordPolicyRule.TOO_SHORT, params: { min: requirements.minLength } };
    if (length > requirements.maxLength) return { code: PasswordPolicyRule.TOO_LONG, params: { max: requirements.maxLength } };
    if (isRepeatedOrSequential(value)) return { code: PasswordPolicyRule.REPEATED_OR_SEQUENTIAL };
    if (isDerivedFromEmail(value, email)) return { code: PasswordPolicyRule.EMAIL_BASED };
    return null;
}
