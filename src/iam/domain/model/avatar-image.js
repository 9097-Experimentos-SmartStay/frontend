/**
 * Rules of the picture a user chooses for their profile. The browser checks them before touching the file; the
 * picture then goes out cropped and shrunk (see avatar-image-processor.js), well under the API limit of 512 KB.
 */

/** Pictures the browser can read and the API accepts once re-encoded. */
export const AVATAR_SOURCE_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);

/** Largest file that may be chosen (a phone photo); what is uploaded is much smaller. */
export const AVATAR_SOURCE_MAX_BYTES = 10 * 1024 * 1024;

/** Side of the square picture that is uploaded, in pixels. */
export const AVATAR_SIZE_PX = 320;

/** Why a chosen picture is rejected (i18n `profileDetail.avatar.<code>`). */
export const AvatarRuleError = Object.freeze({
    TYPE: 'typeNotAllowed',
    TOO_LARGE: 'tooLarge',
    UNREADABLE: 'unreadable',
});

/**
 * @param {File|null|undefined} file
 * @returns {{code: string, params?: Object}|null} The broken rule, or null when the picture can be used.
 */
export function validateAvatarFile(file) {
    if (!file || !AVATAR_SOURCE_TYPES.includes(file.type)) return { code: AvatarRuleError.TYPE };
    if (file.size > AVATAR_SOURCE_MAX_BYTES) {
        return { code: AvatarRuleError.TOO_LARGE, params: { maxMb: AVATAR_SOURCE_MAX_BYTES / (1024 * 1024) } };
    }
    return null;
}
