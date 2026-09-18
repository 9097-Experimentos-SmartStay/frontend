/**
 * Maps an error thrown by the API layer (axios) to an i18n key.
 *
 * @param {unknown} error - Usually an AxiosError.
 * @param {Record<number, string>} [overrides] - Specific keys per HTTP status (e.g. {401: 'auth.invalidCredentials'}).
 * @returns {string} An i18n key.
 */
export function apiErrorKey(error, overrides = {}) {
    const status = error?.response?.status;

    if (!status) {
        // The request left the browser but no response came back (backend down, CORS, offline).
        return error?.request ? 'errors.network' : 'errors.unexpected';
    }
    if (overrides[status]) return overrides[status];
    if (status >= 500) return 'errors.server';
    if (status === 403) return 'errors.forbidden';
    if (status === 404) return 'errors.notFound';
    return 'errors.unexpected';
}
