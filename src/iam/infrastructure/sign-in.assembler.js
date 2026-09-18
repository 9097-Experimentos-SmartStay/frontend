/**
 * @class SignInAssembler
 * @summary Assembler for converting sign-in API responses to resources.
 */
export class SignInAssembler {
    /**
     * @static
     * @param {Object} response - The API response object.
     * @param {number} response.status - The HTTP status code.
     * @param {Object} response.data - The response data.
     * @returns {Object|null} The sign-in payload ({id, username, token, role|roles}) or null if unusable.
     */
    static toResourceFromResponse(response) {
        // TODO(phase-2b): only HTTP 200 is accepted and the raw payload is returned.
        if (response.status !== 200) return null;
        if (!response.data) return null;
        return response.data;
    }
}
