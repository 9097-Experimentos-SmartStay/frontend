/**
 * RFC 7807 ProblemDetails, as returned by every SmartStay API error
 * (content type `application/problem+json`, including 401/403 and IAM endpoints).
 *
 * Every problem carries a stable machine-readable `code` (e.g. `booking.room_unavailable`), and a validation
 * problem (`validation.failed`) lists one `violation` per broken field rule, each with its own `code`
 * (e.g. `password.too_short` + `params.minLength`). Clients branch and translate ONLY on those codes: `detail`
 * is English for developers and is never shown nor inspected.
 *
 * The API layer throws axios errors; {@link ProblemDetails.fromError} turns one into a plain,
 * framework-free object the stores and views can reason about without knowing axios.
 */
export class ProblemDetails {
    /**
     * @param {Object} params
     * @param {number|null} params.status - HTTP status (null when no response arrived).
     * @param {string} [params.title]
     * @param {string} [params.detail] - English, for logs only.
     * @param {string|null} [params.code] - Stable code of the problem.
     * @param {Record<string, unknown>} [params.params] - Values of the problem's rule (e.g. the duplicated room number).
     * @param {Record<string, FieldViolation[]>} [params.fieldViolations] - Broken rules per camelCase field name.
     * @param {Record<string, unknown>} [params.extensions] - Extra members (passwordRecoveryUrl, lockedUntil, reason...).
     * @param {number|null} [params.retryAfterSeconds] - From the Retry-After header of a 429.
     * @param {boolean} [params.isNetworkError] - The request left the browser but no response came back.
     */
    constructor({ status, title = '', detail = '', code = null, params = {}, fieldViolations = {}, extensions = {}, retryAfterSeconds = null, isNetworkError = false }) {
        this.status = status;
        this.title = title;
        this.detail = detail;
        this.code = code;
        this.params = params;
        this.fieldViolations = fieldViolations;
        this.extensions = extensions;
        this.retryAfterSeconds = retryAfterSeconds;
        this.isNetworkError = isNetworkError;
    }

    /** @returns {boolean} True when the API reported at least one invalid field. */
    get hasFieldErrors() {
        return Object.keys(this.fieldViolations).length > 0;
    }

    /**
     * @param {...string} codes
     * @returns {boolean} True when the problem's code is one of `codes`.
     */
    is(...codes) {
        return codes.includes(this.code);
    }

    /**
     * @param {string} field - camelCase field name.
     * @returns {FieldViolation|null} The first rule the field broke, or null when the field is valid.
     */
    violationOf(field) {
        return this.fieldViolations[field]?.[0] ?? null;
    }

    /**
     * @param {string} field
     * @param {...string} codes
     * @returns {boolean} True when the field broke one of the rules `codes`.
     */
    fieldHas(field, ...codes) {
        return (this.fieldViolations[field] ?? []).some((violation) => codes.includes(violation.code));
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
        const { type, title, status, detail, instance, traceId, errors, code, params, violations, ...extensions } = body;
        const retryAfter = Number(response.headers?.['retry-after']);

        return new ProblemDetails({
            status: response.status,
            title: title ?? '',
            detail: detail ?? '',
            code: typeof code === 'string' ? code : null,
            params: params && typeof params === 'object' ? params : {},
            fieldViolations: groupViolations(violations),
            extensions,
            retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : null,
        });
    }
}

/**
 * @typedef {Object} FieldViolation
 * @property {string} code - Stable code of the broken rule (`field.required`, `password.breached`...).
 * @property {Record<string, unknown>} params - Values of the rule (`minLength`, `maxLength`, `min`, `max`, `allowed`...).
 */

/**
 * Groups the API `violations` by field. Field names are camelCase JSON names; a JSON path ("$.guest.email")
 * keeps its last segment, which is what the forms use.
 * @param {unknown} violations
 * @returns {Record<string, FieldViolation[]>}
 */
function groupViolations(violations) {
    if (!Array.isArray(violations)) return {};
    const result = {};
    for (const violation of violations) {
        if (!violation || typeof violation.code !== 'string') continue;
        const rawField = String(violation.field ?? '');
        const leaf = rawField.replace(/^\$\.?/, '').split('.').pop() ?? rawField;
        const field = leaf.charAt(0).toLowerCase() + leaf.slice(1);
        (result[field] ??= []).push({ code: violation.code, params: violation.params ?? {} });
    }
    return result;
}
