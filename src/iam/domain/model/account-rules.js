import { Email } from './email.js';
import { checkPasswordPolicy, passwordRequirementsFor } from './password-policy.js';

/**
 * Field rules of the account forms, mirroring the backend validation (§2.1, §2.5, §3) and the
 * password policy (password-policy.js): the user sees the same error before sending the form
 * that the API would return after.
 *
 * A validator returns null when the value is valid, or a {@link RuleViolation}: an error CODE plus
 * the parameters of its message. The presentation layer maps codes to i18n keys (`validation.<code>`).
 */
export const AccountRuleError = Object.freeze({
    REQUIRED: 'required',
    EMAIL_FORMAT: 'emailFormat',
    NAME_FORMAT: 'nameFormat',
    PASSWORD_TOO_SHORT: 'passwordTooShort',
    PASSWORD_TOO_LONG: 'passwordTooLong',
    PASSWORD_MISMATCH: 'passwordMismatch',
    PASSWORD_REJECTED: 'passwordRejected',
});

/**
 * @typedef {Object} RuleViolation
 * @property {string} code - One of {@link AccountRuleError}.
 * @property {Record<string, unknown>} [params] - Values for the message (e.g. {min: 15}).
 */

/** 2–50 letters (accents allowed); single spaces, hyphens or apostrophes between them. */
const PERSON_NAME_PATTERN = /^(?=.{2,50}$)\p{L}+(?:[ '\-]\p{L}+)*$/u;

const isBlank = (value) => value == null || String(value).trim() === '';
const violation = (code, params) => (params ? { code, params } : { code });

/**
 * @param {string} value
 * @returns {RuleViolation|null}
 */
export function validateEmail(value) {
    if (isBlank(value)) return violation(AccountRuleError.REQUIRED);
    return Email.isValid(value) ? null : violation(AccountRuleError.EMAIL_FORMAT);
}

/**
 * @param {string} value - A first or last name.
 * @returns {RuleViolation|null}
 */
export function validatePersonName(value) {
    if (isBlank(value)) return violation(AccountRuleError.REQUIRED);
    return PERSON_NAME_PATTERN.test(String(value).trim()) ? null : violation(AccountRuleError.NAME_FORMAT);
}

/**
 * New password against the policy of the account's role (length, repeated/sequential runs, e-mail-based;
 * no composition rules). Common and breached passwords are only known by the backend.
 * @param {string} value
 * @param {import('./password-policy.js').PasswordRequirements} [requirements]
 * @param {string|null} [email] - E-mail of the account, when known.
 * @returns {RuleViolation|null}
 */
export function validateNewPassword(value, requirements = passwordRequirementsFor(null), email = null) {
    if (!value) return violation(AccountRuleError.REQUIRED);
    return checkPasswordPolicy(value, requirements, email);
}

/**
 * Sign-in only checks presence: the policy must not leak through the login form.
 * @param {string} value
 * @returns {RuleViolation|null}
 */
export function validatePasswordPresent(value) {
    return value ? null : violation(AccountRuleError.REQUIRED);
}

/**
 * @param {string} password
 * @param {string} confirmation
 * @returns {RuleViolation|null}
 */
export function validatePasswordConfirmation(password, confirmation) {
    if (!confirmation) return violation(AccountRuleError.REQUIRED);
    return password === confirmation ? null : violation(AccountRuleError.PASSWORD_MISMATCH);
}

/**
 * @param {unknown} value
 * @returns {RuleViolation|null}
 */
export function validateRequired(value) {
    return value == null || value === '' ? violation(AccountRuleError.REQUIRED) : null;
}

/**
 * Runs a map of validators and keeps only the failing fields.
 * @param {Record<string, () => RuleViolation|null>} validators
 * @returns {Record<string, RuleViolation>} Violation per invalid field (empty when everything is valid).
 */
export function collectErrors(validators) {
    const errors = {};
    for (const [field, validate] of Object.entries(validators)) {
        const result = validate();
        if (result) errors[field] = result;
    }
    return errors;
}
