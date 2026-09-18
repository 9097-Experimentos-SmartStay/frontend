import { AuthFailureReason } from '../../application/auth-failure.js';
import { AccountRuleError } from '../../domain/model/account-rules.js';
import { apiErrorKey } from '@/shared/presentation/utils/api-error.js';

/**
 * Localized message of an {@link import('../../application/auth-failure.js').AuthFailure}.
 * @param {Function} t - vue-i18n `t`.
 * @param {string} locale - Current locale (to format the lock time).
 * @param {import('../../application/auth-failure.js').AuthFailure} failure
 * @returns {string}
 */
export function authFailureMessage(t, locale, failure) {
    switch (failure?.reason) {
        case AuthFailureReason.INVALID_CREDENTIALS:
            return t('auth.errors.invalidCredentials');
        case AuthFailureReason.ACCOUNT_LOCKED: {
            const until = failure.lockedUntil;
            return until
                ? t('auth.errors.accountLocked', { time: until.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) })
                : t('auth.errors.accountLockedNoTime');
        }
        case AuthFailureReason.ACCOUNT_DEACTIVATED:
            return t('auth.errors.accountDeactivated');
        case AuthFailureReason.EMAIL_ALREADY_REGISTERED:
            return t('auth.errors.emailAlreadyRegistered');
        case AuthFailureReason.RATE_LIMITED:
            return failure.retryAfterSeconds
                ? t('auth.errors.rateLimited', { seconds: failure.retryAfterSeconds })
                : t('auth.errors.rateLimitedNoTime');
        default:
            return t(apiErrorKey(failure?.problem));
    }
}

/**
 * Localized messages for the rule violations of account-rules.js (`{code: 'required'}` → `validation.required`).
 * @param {Function} t
 * @param {Record<string, import('../../domain/model/account-rules.js').RuleViolation>} violations
 * @returns {Record<string, string>} Message per field.
 */
export function validationMessages(t, violations) {
    return Object.fromEntries(
        Object.entries(violations).map(([field, { code, params }]) => [field, t(`validation.${code}`, params ?? {})])
    );
}

const BREACHED_PASSWORD = /breach|pwned|compromis|common|leak|filtrad|comprometid|frecuente/i;
const LENGTH_PROBLEM = /characters|length|at least|between|caracteres/i;

/**
 * Messages for the invalid fields a 400 reported, shown under each input.
 *
 * The client validates with the same rules, so for most fields a server error means the same rule failed
 * and its localized message is shown. Passwords are special: the backend also rejects breached or common
 * passwords (a check the client cannot do), so that case gets its own message, and any other password
 * reason is shown with the server text.
 *
 * @param {Function} t
 * @param {import('../../application/auth-failure.js').AuthFailure} failure
 * @param {Record<string, import('../../domain/model/account-rules.js').RuleViolation>} violationByField -
 *   Violation to show when the field is invalid (keys: camelCase API field names).
 * @param {Record<string, string>} [formFieldByApiField] - Renames API fields to form fields ({newPassword: 'password'}).
 * @returns {Record<string, string>} Message per form field (empty when no known field failed).
 */
export function serverFieldMessages(t, failure, violationByField, formFieldByApiField = {}) {
    const messages = {};
    for (const [apiField, serverMessages] of Object.entries(failure?.fieldErrors ?? {})) {
        if (!(apiField in violationByField)) continue;
        const formField = formFieldByApiField[apiField] ?? apiField;
        const text = serverMessages.join(' ');
        const expected = violationByField[apiField];

        let violation = expected;
        if (/required/i.test(text)) {
            violation = { code: AccountRuleError.REQUIRED };
        } else if (isPasswordViolation(expected)) {
            if (BREACHED_PASSWORD.test(text)) violation = { code: 'passwordBreached' };
            else if (!LENGTH_PROBLEM.test(text)) violation = { code: AccountRuleError.PASSWORD_REJECTED, params: { reason: text } };
        }
        messages[formField] = t(`validation.${violation.code}`, violation.params ?? {});
    }
    return messages;
}

function isPasswordViolation(violation) {
    return [AccountRuleError.PASSWORD_TOO_SHORT, AccountRuleError.PASSWORD_TOO_LONG].includes(violation?.code);
}
