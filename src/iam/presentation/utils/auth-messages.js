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
        case AuthFailureReason.EMAIL_NOT_VERIFIED:
            return t('auth.errors.emailNotVerified');
        case AuthFailureReason.MFA_CODE_INVALID:
            return t('auth.mfa.errors.codeInvalid');
        case AuthFailureReason.MFA_CODE_ALREADY_USED:
            return t('auth.mfa.errors.codeAlreadyUsed');
        case AuthFailureReason.MFA_RECOVERY_CODE_INVALID:
            return t('auth.mfa.errors.recoveryCodeInvalid');
        case AuthFailureReason.MFA_CHALLENGE_EXPIRED:
            return t('auth.mfa.errors.challengeExpired');
        case AuthFailureReason.MFA_ENROLLMENT_NOT_STARTED:
            return t('auth.mfa.errors.enrollmentNotStarted');
        case AuthFailureReason.MFA_ALREADY_ENABLED:
            return t('auth.mfa.errors.alreadyEnabled');
        case AuthFailureReason.WRONG_CURRENT_PASSWORD:
            return t('security.changePassword.wrongCurrent');
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

/**
 * Messages for the invalid fields a 400 reported, shown under each input.
 *
 * The client validates with the same rules, so for most fields a server error means the same rule failed
 * and its localized message is shown. Passwords are special: the backend also rejects common and breached
 * passwords (checks the client cannot do), so each password rule of §2.0 is recognized by its code and gets its
 * own message; an unknown code gets a generic localized message.
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
    for (const [apiField, apiViolations] of Object.entries(failure?.fieldViolations ?? {})) {
        if (!(apiField in violationByField)) continue;
        const formField = formFieldByApiField[apiField] ?? apiField;
        const expected = violationByField[apiField];
        const codes = apiViolations.map(({ code }) => code);

        let violation = expected;
        if (codes.some((code) => REQUIRED_CODES.includes(code))) {
            violation = { code: AccountRuleError.REQUIRED };
        } else if (isPasswordViolation(expected)) {
            violation = failure.passwordViolation(apiField) ?? { code: AccountRuleError.PASSWORD_REJECTED };
        }
        messages[formField] = t(`validation.${violation.code}`, violation.params ?? {});
    }
    return messages;
}

/** API codes of an empty required field. */
const REQUIRED_CODES = Object.freeze(['field.required', 'password.required', 'name.required', 'email.required']);

function isPasswordViolation(violation) {
    return [AccountRuleError.PASSWORD_TOO_SHORT, AccountRuleError.PASSWORD_TOO_LONG].includes(violation?.code);
}
