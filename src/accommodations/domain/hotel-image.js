/**
 * Rules of the file an administrator uploads as the main image of a hotel. They mirror the signed upload preset
 * of Cloudinary (`smartstay-hotels`: jpg, jpeg, png or webp), and are checked in the browser before asking the API
 * for an upload signature, so a wrong file never leaves the device.
 */

/** Accepted MIME types (Cloudinary preset formats: jpg/jpeg, png, webp). */
export const HOTEL_IMAGE_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);

/** Accepted file extensions, for browsers that report no MIME type. */
const HOTEL_IMAGE_EXTENSIONS = Object.freeze(['jpg', 'jpeg', 'png', 'webp']);

/** Largest file accepted: 10 MB (Cloudinary resizes it on arrival to at most 2000 × 2000). */
export const HOTEL_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/** Why a hotel image file is rejected (i18n `staffHotels.upload.<code>`). */
export const HotelImageRuleError = Object.freeze({
    TYPE: 'imageTypeNotAllowed',
    TOO_LARGE: 'imageTooLarge',
});

/**
 * @param {File|null|undefined} file
 * @returns {{code: string, params?: Object}|null} The broken rule, or null when the file can be uploaded.
 */
export function validateHotelImageFile(file) {
    if (!file) return { code: HotelImageRuleError.TYPE };
    const extension = String(file.name ?? '').split('.').pop()?.toLowerCase() ?? '';
    const typeAllowed = file.type ? HOTEL_IMAGE_TYPES.includes(file.type) : HOTEL_IMAGE_EXTENSIONS.includes(extension);
    if (!typeAllowed) return { code: HotelImageRuleError.TYPE };
    if (file.size > HOTEL_IMAGE_MAX_BYTES) return { code: HotelImageRuleError.TOO_LARGE, params: { maxMb: HOTEL_IMAGE_MAX_BYTES / (1024 * 1024) } };
    return null;
}
