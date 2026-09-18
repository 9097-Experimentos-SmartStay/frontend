import { UserRole } from '../user-role.js';

/**
 * Password policy (NIST SP 800-63B-4, decision in audit/08-plan-backlog.md), in ONE place.
 *
 * - Length is the only local rule: guests (no MFA) need at least 15 characters (passphrases, spaces and
 *   Unicode welcome); staff roles (MFA TOTP) at least 8. Everyone at most 128.
 * - NO composition rules (no "one uppercase, one symbol"...).
 * - Breached/common passwords are rejected by the backend (400 with a field error on the password);
 *   the form shows that error under the input.
 *
 * The backend still accepts 8–128 for everyone until it adopts this policy; being stricter here is safe.
 * To change the policy, change only this file.
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
