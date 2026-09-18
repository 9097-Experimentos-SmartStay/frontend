import { FailureReason } from '@/shared/application/operation-failure.js';
import { apiErrorKey } from './api-error.js';

const GENERIC_KEYS = Object.freeze({
    [FailureReason.INVALID_DATA]: 'errors.invalidData',
    [FailureReason.FORBIDDEN]: 'errors.forbidden',
    [FailureReason.NOT_FOUND]: 'errors.notFound',
    [FailureReason.CONFLICT]: 'errors.conflict',
    [FailureReason.RATE_LIMITED]: 'errors.tooManyRequests',
    [FailureReason.NETWORK]: 'errors.network',
    [FailureReason.SERVER]: 'errors.server',
    [FailureReason.UNEXPECTED]: 'errors.unexpected',
});

/**
 * i18n key for a failed operation.
 * @param {import('@/shared/application/operation-failure.js').OperationFailure|unknown} failure
 * @param {Record<string, string>} [keyByReason] - Keys for the business reasons of the use case.
 * @returns {string}
 */
export function failureMessageKey(failure, keyByReason = {}) {
    const reason = failure?.reason;
    if (reason && keyByReason[reason]) return keyByReason[reason];
    if (reason && GENERIC_KEYS[reason]) return GENERIC_KEYS[reason];
    return apiErrorKey(failure?.problem ?? failure);
}

/**
 * Localized messages for the rule violations of a form, looked up as `<prefix>.<code>`.
 * @param {Function} t
 * @param {Record<string, {code: string, params?: Object}>} violations
 * @param {string} prefix - E.g. 'staffRooms.rules'.
 * @returns {Record<string, string>}
 */
export function violationMessages(t, violations, prefix) {
    return Object.fromEntries(
        Object.entries(violations ?? {}).map(([field, { code, params }]) => [field, t(`${prefix}.${code}`, params ?? {})])
    );
}
