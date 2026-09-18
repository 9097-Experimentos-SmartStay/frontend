import { ProblemDetails } from '@/shared/infrastructure/http/problem-details.js';

/**
 * Maps an error thrown by the API layer to an i18n key.
 *
 * The backend `detail` is English and meant for developers, so the UI never shows it as is:
 * each status gets a localized message, and views pass `overrides` for the statuses that mean
 * something specific in their use case (e.g. {409: 'bookings.roomNotAvailable'}).
 *
 * @param {unknown} error - An AxiosError or a {@link ProblemDetails}.
 * @param {Record<number, string>} [overrides] - Specific keys per HTTP status.
 * @returns {string} An i18n key.
 */
export function apiErrorKey(error, overrides = {}) {
    const problem = ProblemDetails.fromError(error);
    const { status } = problem;

    if (!status) {
        // The request left the browser but no response came back (backend down, CORS, offline).
        return problem.isNetworkError ? 'errors.network' : 'errors.unexpected';
    }
    if (overrides[status]) return overrides[status];
    if (status >= 500) return 'errors.server';
    if (status === 400) return 'errors.invalidData';
    if (status === 403) return 'errors.forbidden';
    if (status === 404) return 'errors.notFound';
    if (status === 409) return 'errors.conflict';
    if (status === 429) return 'errors.tooManyRequests';
    return 'errors.unexpected';
}
