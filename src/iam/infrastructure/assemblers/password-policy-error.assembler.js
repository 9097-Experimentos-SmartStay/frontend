import { PasswordPolicyRule } from '../../domain/model/password-policy.js';

/**
 * Anti-corruption layer for the password field errors of the API (§2.0).
 *
 * The backend reports a broken password rule as an English sentence in `errors.password` /
 * `errors.newPassword`. This translates each sentence of the contract into the same rule codes the client
 * validation uses, so the form shows one localized message per rule whether it failed locally or on the server.
 */
const RULES = Object.freeze([
    { pattern: /at least (\d+) characters/i, toViolation: (match) => ({ code: PasswordPolicyRule.TOO_SHORT, params: { min: Number(match[1]) } }) },
    { pattern: /between (\d+) and (\d+) characters/i, toViolation: (match) => ({ code: PasswordPolicyRule.TOO_SHORT, params: { min: Number(match[1]) } }) },
    { pattern: /cannot exceed (\d+) characters/i, toViolation: (match) => ({ code: PasswordPolicyRule.TOO_LONG, params: { max: Number(match[1]) } }) },
    { pattern: /too common|easy to guess/i, toViolation: () => ({ code: PasswordPolicyRule.COMMON }) },
    { pattern: /repeated or sequential/i, toViolation: () => ({ code: PasswordPolicyRule.REPEATED_OR_SEQUENTIAL }) },
    { pattern: /e-?mail address or its user name/i, toViolation: () => ({ code: PasswordPolicyRule.EMAIL_BASED }) },
    { pattern: /breach|pwned/i, toViolation: () => ({ code: PasswordPolicyRule.BREACHED }) },
]);

/**
 * @param {string} message - One server message of a password field.
 * @returns {{code: string, params?: Record<string, unknown>}|null} The broken rule, or null for an unknown text.
 */
export function passwordViolationFromServerMessage(message) {
    for (const { pattern, toViolation } of RULES) {
        const match = pattern.exec(message ?? '');
        if (match) return toViolation(match);
    }
    return null;
}
