import { isValidRoomNumber, normalizeRoomNumber } from './model/room-number.js';

/** Price limits of a room per night (US-53: greater than 0; the backend caps it at 100000). */
export const ROOM_PRICE_MIN = 0.01;
export const ROOM_PRICE_MAX = 100000;
export const ROOM_DESCRIPTION_MAX_LENGTH = 1000;

/** Why a room form is invalid (i18n `staffRooms.rules.<code>`). */
export const RoomRuleError = Object.freeze({
    REQUIRED: 'required',
    NUMBER_FORMAT: 'numberFormat',
    DUPLICATE_NUMBER: 'duplicateNumber',
    PRICE_RANGE: 'priceRange',
    DESCRIPTION_TOO_LONG: 'descriptionTooLong',
    UNKNOWN_TYPE: 'unknownType',
    UNKNOWN_HOTEL: 'unknownHotel',
});

/**
 * Rules of POST/PUT /rooms (§5, US-53 scenario 3), checked before sending: nothing is saved when a field is wrong.
 * @param {{hotelId: number|null, number: string, roomTypeId: number|null, price: number|null, description: string}} form
 * @returns {Record<string, {code: string, params?: Object}>} Violation per invalid field (empty when valid).
 */
export function validateRoomForm(form) {
    const errors = {};
    if (form.hotelId == null) errors.hotelId = { code: RoomRuleError.REQUIRED };
    if (!normalizeRoomNumber(form.number)) errors.number = { code: RoomRuleError.REQUIRED };
    else if (!isValidRoomNumber(form.number)) errors.number = { code: RoomRuleError.NUMBER_FORMAT };
    if (form.roomTypeId == null) errors.roomTypeId = { code: RoomRuleError.REQUIRED };
    if (form.price == null || form.price === '') errors.price = { code: RoomRuleError.REQUIRED };
    else if (Number(form.price) < ROOM_PRICE_MIN || Number(form.price) > ROOM_PRICE_MAX) {
        errors.price = { code: RoomRuleError.PRICE_RANGE, params: { min: ROOM_PRICE_MIN, max: ROOM_PRICE_MAX } };
    }
    if (!form.description?.trim()) errors.description = { code: RoomRuleError.REQUIRED };
    else if (form.description.trim().length > ROOM_DESCRIPTION_MAX_LENGTH) {
        errors.description = { code: RoomRuleError.DESCRIPTION_TOO_LONG, params: { max: ROOM_DESCRIPTION_MAX_LENGTH } };
    }
    return errors;
}

/** Room type (US-53 scenario 2): name 2–50, description up to 500. */
export const ROOM_TYPE_NAME_MIN = 2;
export const ROOM_TYPE_NAME_MAX = 50;
export const ROOM_TYPE_DESCRIPTION_MAX = 500;

/**
 * @param {{name: string, description: string}} form
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function validateRoomTypeForm(form) {
    const errors = {};
    const name = form.name?.trim() ?? '';
    const description = form.description?.trim() ?? '';
    if (!name) errors.name = { code: RoomRuleError.REQUIRED };
    else if (name.length < ROOM_TYPE_NAME_MIN || name.length > ROOM_TYPE_NAME_MAX) {
        errors.name = { code: 'lengthRange', params: { min: ROOM_TYPE_NAME_MIN, max: ROOM_TYPE_NAME_MAX } };
    }
    if (!description) errors.description = { code: RoomRuleError.REQUIRED };
    else if (description.length > ROOM_TYPE_DESCRIPTION_MAX) {
        errors.description = { code: RoomRuleError.DESCRIPTION_TOO_LONG, params: { max: ROOM_TYPE_DESCRIPTION_MAX } };
    }
    return errors;
}
