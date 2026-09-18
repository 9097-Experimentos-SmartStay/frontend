import { RoomRuleError, ROOM_PRICE_MAX, ROOM_PRICE_MIN } from '../domain/room-rules.js';
import { HotelRuleError } from '../domain/hotel-rules.js';
import { AccommodationFailureReason } from '../application/accommodation-failure.js';

/**
 * Anti-corruption layer for the errors of /hotels, /rooms and /room-types (§4–§6, US-53).
 * Maps the stable `code` of a problem to a business reason, and the code of each field violation to the same
 * rule codes the forms validate with, so a field shows one localized message whether it failed here or in the API.
 */

/** Problem codes of the Accommodations context (§0 catalog) → business reason. */
const REASON_BY_CODE = Object.freeze({
    'room.invalid_status_transition': AccommodationFailureReason.INVALID_STATUS_TRANSITION,
    'room.number_taken': AccommodationFailureReason.DUPLICATE_ROOM_NUMBER,
    'room.has_active_bookings': AccommodationFailureReason.HAS_ACTIVE_BOOKINGS,
    'hotel.has_active_bookings': AccommodationFailureReason.HAS_ACTIVE_BOOKINGS,
    'hotel.admin_already_has_hotel': AccommodationFailureReason.HOTEL_ALREADY_REGISTERED,
    'media.uploads_not_configured': AccommodationFailureReason.IMAGE_UPLOADS_NOT_CONFIGURED,
});

/**
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {string|null}
 */
export function classifyAccommodationProblem(problem) {
    return REASON_BY_CODE[problem.code] ?? null;
}

/**
 * Field violations of POST/PUT /rooms (§5 US-53 scenario 3).
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function roomFieldViolations(problem) {
    const violations = {};
    if (problem.violationOf('number')) {
        violations.number = { code: problem.fieldHas('number', 'field.required') ? RoomRuleError.REQUIRED : RoomRuleError.NUMBER_FORMAT };
    }
    if (problem.violationOf('roomTypeId')) {
        violations.roomTypeId = { code: problem.fieldHas('roomTypeId', 'room_type.not_found') ? RoomRuleError.UNKNOWN_TYPE : RoomRuleError.REQUIRED };
    }
    if (problem.violationOf('price')) violations.price = { code: RoomRuleError.PRICE_RANGE, params: { min: ROOM_PRICE_MIN, max: ROOM_PRICE_MAX } };
    if (problem.violationOf('description')) {
        violations.description = problem.fieldHas('description', 'field.length')
            ? { code: RoomRuleError.DESCRIPTION_TOO_LONG, params: { max: problem.violationOf('description').params.maxLength } }
            : { code: RoomRuleError.REQUIRED };
    }
    if (problem.violationOf('hotelId')) violations.hotelId = { code: RoomRuleError.UNKNOWN_HOTEL };
    if (problem.is('room.number_taken')) {
        violations.number = { code: RoomRuleError.DUPLICATE_NUMBER, params: { number: problem.params.number ?? '' } };
    }
    return violations;
}

/**
 * Field violations of POST/PUT /hotels: each invalid field gets the rule of its limits (§4).
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function hotelFieldViolations(problem) {
    const violations = {};
    for (const [field, fieldViolations] of Object.entries(problem.fieldViolations)) {
        const codes = fieldViolations.map(({ code }) => code);
        const length = fieldViolations.find(({ code }) => code === 'field.length');
        if (codes.includes('field.required')) violations[field] = { code: HotelRuleError.REQUIRED };
        else if (codes.includes('hotel.image_url_not_allowed')) violations[field] = { code: HotelRuleError.IMAGE_NOT_HOSTED };
        else if (codes.includes('field.invalid_url')) violations[field] = { code: HotelRuleError.URL };
        else if (length?.params.minLength != null) {
            violations[field] = { code: HotelRuleError.LENGTH, params: { min: length.params.minLength, max: length.params.maxLength } };
        } else if (length) violations[field] = { code: HotelRuleError.TOO_LONG, params: { max: length.params.maxLength } };
        else violations[field] = { code: 'serverRejected' };
    }
    return violations;
}

/**
 * Field violations of POST /room-types (name 2–50, description ≤ 500).
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function roomTypeFieldViolations(problem) {
    const violations = {};
    if (problem.violationOf('name')) violations.name = { code: 'lengthRange', params: { min: 2, max: 50 } };
    if (problem.violationOf('description')) violations.description = { code: RoomRuleError.DESCRIPTION_TOO_LONG, params: { max: 500 } };
    return violations;
}
