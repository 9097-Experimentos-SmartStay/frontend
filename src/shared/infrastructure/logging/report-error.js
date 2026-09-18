/**
 * Minimal error reporting.
 *
 * Logs a short line (context, HTTP status, message) instead of the whole error object:
 * an AxiosError carries the request config, including the Authorization header (JWT).
 *
 * @param {string} context - What was being done (e.g. 'Error fetching hotels').
 * @param {unknown} error
 */
export function reportError(context, error) {
    const status = error?.response?.status;
    const message = error?.message ?? String(error);
    console.error(status ? `${context} [HTTP ${status}]: ${message}` : `${context}: ${message}`);
}
