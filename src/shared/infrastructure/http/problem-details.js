/**
 * RFC 7807 ProblemDetails, as returned by every SmartStay API error
 * (content type `application/problem+json`, including 401/403 and IAM endpoints).
 *
 * The API layer throws axios errors; {@link ProblemDetails.fromError} turns one into a plain,
 * framework-free object the stores and views can reason about without knowing axios.
 */
export class ProblemDetails {
    /**
     * @param {Object} params
     * @param {number|null} params.status - HTTP status (null when no response arrived).
     * @param {string} [params.title]
     * @param {string} [params.detail]
     * @param {Record<string, string[]>} [params.fieldErrors] - Validation errors keyed by camelCase field name.
     * @param {Record<string, unknown>} [params.extensions] - Extra members (passwordRecoveryUrl, lockedUntil...).
     * @param {number|null} [params.retryAfterSeconds] - From the Retry-After header of a 429.
     * @param {boolean} [params.isNetworkError] - The request left the browser but no response came back.
     */
    constructor({ status, title = '', detail = '', fieldErrors = {}, extensions = {}, retryAfterSeconds = null, isNetworkError = false }) {
        this.status = status;
        this.title = title;
        this.detail = detail;
        this.fieldErrors = fieldErrors;
        this.extensions = extensions;
        this.retryAfterSeconds = retryAfterSeconds;
        this.isNetworkError = isNetworkError;
    }

    /** @returns {boolean} True when the API reported at least one invalid field. */
    get hasFieldErrors() {
        return Object.keys(this.fieldErrors).length > 0;
    }

    /**
     * @param {string} text - Case-insensitive fragment to look for in `detail`.
     * @returns {boolean}
     */
    detailIncludes(text) {
        return this.detail.toLowerCase().includes(text.toLowerCase());
    }

    /**
     * Builds a ProblemDetails from anything thrown by the HTTP layer.
     * @param {unknown} error - Usually an AxiosError.
     * @returns {ProblemDetails}
     */
    static fromError(error) {
        if (error instanceof ProblemDetails) return error;

        const response = error?.response;
        if (!response) {
            return new ProblemDetails({ status: null, isNetworkError: !!error?.request, detail: error?.message ?? '' });
        }

        const body = response.data && typeof response.data === 'object' ? response.data : {};
        const { type, title, status, detail, instance, traceId, errors, ...extensions } = body;
        const retryAfter = Number(response.headers?.['retry-after']);

        return new ProblemDetails({
            status: response.status,
            title: title ?? '',
            detail: detail ?? '',
            fieldErrors: normalizeFieldErrors(errors),
            extensions,
            retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : null,
        });
    }
}

/**
 * The backend keys validation errors by C# property name ("Email", "FirstName", "$.password").
 * Forms use camelCase, so keys are normalized once here.
 * @param {unknown} errors
 * @returns {Record<string, string[]>}
 */
function normalizeFieldErrors(errors) {
    if (!errors || typeof errors !== 'object') return {};
    const result = {};
    for (const [rawKey, messages] of Object.entries(errors)) {
        const key = rawKey.replace(/^\$\./, '').split('.').pop() ?? rawKey;
        const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        result[camelKey] = Array.isArray(messages) ? messages.map(String) : [String(messages)];
    }
    return result;
}
