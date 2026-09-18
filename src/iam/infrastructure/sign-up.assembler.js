import {SignUpResource} from "./sign-up.resource.js";

/**
 * @class SignUpAssembler
 * @summary Assembler for converting sign-up API responses to resources.
 */
export class SignUpAssembler {
    /**
     * @static
     * @param {Object} response - The API response object.
     * @param {number} response.status - The HTTP status code.
     * @param {string} response.statusText - The status text.
     * @param {Object} response.data - The response data.
     * @returns {SignUpResource|null} The assembled SignUpResource or null if error.
     */
    static toResourceFromResponse(response) {
        // Accept both 200 (OK) and 201 (Created)
        if (response.status !== 200 && response.status !== 201) {
            return null;
        }
        return new SignUpResource(response.data);
    }
}