/**
 * Room number (US-53): what guests and staff see ("101", "2B", "PH-1"), unique within a hotel.
 * 1 to 10 letters, digits or hyphens, starting with a letter or digit; stored upper case (same rule as the backend).
 * The `id` of a room is only for URLs.
 */
export const ROOM_NUMBER_MAX_LENGTH = 10;

const ROOM_NUMBER = /^[A-Z0-9][A-Z0-9-]{0,9}$/;

/**
 * @param {string|null|undefined} value
 * @returns {string} Trimmed and upper case.
 */
export function normalizeRoomNumber(value) {
    return String(value ?? '').trim().toUpperCase();
}

/**
 * @param {string|null|undefined} value
 * @returns {boolean}
 */
export function isValidRoomNumber(value) {
    return ROOM_NUMBER.test(normalizeRoomNumber(value));
}
