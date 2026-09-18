import { PasswordPolicyRule } from '../../domain/model/password-policy.js';

/**
 * Anti-corruption layer for the password field violations of the API (§2.0).
 *
 * The backend reports each broken password rule with a stable code (`password.too_short` + `params.minLength`,
 * `password.breached`...). They are mapped to the rule codes the client validation uses, so the form shows one
 * localized message per rule whether it failed locally or on the server. The backend stays the authority on the
 * minimum length: it comes in `params.minLength` (guest 15, staff 8).
 */
const RULE_BY_API_CODE = Object.freeze({
    'password.too_short': (params) => ({ code: PasswordPolicyRule.TOO_SHORT, params: { min: params.minLength } }),
    'password.too_long': (params) => ({ code: PasswordPolicyRule.TOO_LONG, params: { max: params.maxLength } }),
    'password.too_common': () => ({ code: PasswordPolicyRule.COMMON }),
    'password.repetitive': () => ({ code: PasswordPolicyRule.REPEATED_OR_SEQUENTIAL }),
    'password.contains_email': () => ({ code: PasswordPolicyRule.EMAIL_BASED }),
    'password.breached': () => ({ code: PasswordPolicyRule.BREACHED }),
});

/**
 * @param {{code: string, params?: Record<string, unknown>}|null} violation - One API violation of a password field.
 * @returns {{code: string, params?: Record<string, unknown>}|null} The broken rule, or null for an unknown code.
 */
export function passwordRuleFromViolation(violation) {
    const toRule = violation ? RULE_BY_API_CODE[violation.code] : null;
    return toRule ? toRule(violation.params ?? {}) : null;
}
