import { RoomRuleError, ROOM_PRICE_MAX, ROOM_PRICE_MIN } from '../domain/room-rules.js';
import { HotelRuleError } from '../domain/hotel-rules.js';
import { AccommodationFailureReason } from '../application/accommodation-failure.js';

/**
 * Anti-corruption layer for the errors of /hotels, /rooms and /room-types (§4–§6, US-53).
 * Turns the English `detail` of a 409 into a business reason and the per-field `errors` into the same rule
 * codes the forms validate with, so a field shows one localized message whether it failed here or in the API.
 */

/**
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {string|null}
 */
export function classifyAccommodationProblem(problem) {
    if (problem.status !== 409) return null;
    if (problem.detailIncludes('already exists in hotel')) return AccommodationFailureReason.DUPLICATE_ROOM_NUMBER;
    if (problem.detailIncludes('active booking')) return AccommodationFailureReason.HAS_ACTIVE_BOOKINGS;
    if (problem.detailIncludes('already has one') || problem.detailIncludes('single hotel')) {
        return AccommodationFailureReason.HOTEL_ALREADY_REGISTERED;
    }
    return null;
}

/**
 * Field errors of POST/PUT /rooms (captured messages of §5 US-53 scenario 3).
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function roomFieldViolations(problem) {
    const violations = {};
    const text = (field) => (problem.fieldErrors[field] ?? []).join(' ');
    if (text('number')) {
        violations.number = { code: /enter the room number|required/i.test(text('number')) ? RoomRuleError.REQUIRED : RoomRuleError.NUMBER_FORMAT };
    }
    if (text('roomTypeId')) {
        violations.roomTypeId = { code: /does not exist/i.test(text('roomTypeId')) ? RoomRuleError.UNKNOWN_TYPE : RoomRuleError.REQUIRED };
    }
    if (text('price')) violations.price = { code: RoomRuleError.PRICE_RANGE, params: { min: ROOM_PRICE_MIN, max: ROOM_PRICE_MAX } };
    if (text('description')) violations.description = { code: RoomRuleError.REQUIRED };
    if (text('hotelId')) violations.hotelId = { code: RoomRuleError.UNKNOWN_HOTEL };
    if (classifyAccommodationProblem(problem) === AccommodationFailureReason.DUPLICATE_ROOM_NUMBER) {
        const match = /room number (\S+) already exists/i.exec(problem.detail);
        violations.number = { code: RoomRuleError.DUPLICATE_NUMBER, params: { number: match?.[1] ?? '' } };
    }
    return violations;
}

/**
 * Field errors of POST/PUT /hotels: each invalid field gets the rule of its limits (§4).
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function hotelFieldViolations(problem) {
    const violations = {};
    for (const [field, messages] of Object.entries(problem.fieldErrors)) {
        const message = messages.join(' ');
        if (/required/i.test(message)) violations[field] = { code: HotelRuleError.REQUIRED };
        else if (field === 'imageUrl') violations[field] = { code: HotelRuleError.URL };
        else violations[field] = { code: 'serverRejected', params: { reason: message } };
    }
    return violations;
}

/**
 * Field errors of POST /room-types (name 2–50, description ≤ 500).
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function roomTypeFieldViolations(problem) {
    const violations = {};
    if (problem.fieldErrors.name) violations.name = { code: 'lengthRange', params: { min: 2, max: 50 } };
    if (problem.fieldErrors.description) violations.description = { code: RoomRuleError.DESCRIPTION_TOO_LONG, params: { max: 500 } };
    return violations;
}
