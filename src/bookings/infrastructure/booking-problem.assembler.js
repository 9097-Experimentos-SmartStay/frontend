import { BookingFailureReason } from '../application/booking-failure.js';
import { BookingRuleError } from '../domain/commands/create-booking.command.js';
import { StayRuleError } from '../domain/model/stay-period.js';

/**
 * Anti-corruption layer for the errors of /bookings and /rooms/available (§5, §8.1–§8.4).
 * Maps the stable `code` of a problem to a business reason and the codes of the field violations to the rule
 * codes of the forms.
 */

/** Problem codes of the Bookings context (§0 catalog) → business reason. */
const REASON_BY_CODE = Object.freeze({
    'booking.room_unavailable': BookingFailureReason.ROOM_UNAVAILABLE,
    'booking.room_under_maintenance': BookingFailureReason.ROOM_UNAVAILABLE,
    'booking.paid_total_mismatch': BookingFailureReason.PAID_TOTAL_MISMATCH,
    'booking.cancellation_too_late': BookingFailureReason.CHECK_IN_DAY_REACHED,
    'booking.cancellation_not_allowed': BookingFailureReason.NOT_CHANGEABLE,
    'booking.change_not_allowed': BookingFailureReason.NOT_CHANGEABLE,
    'booking.room_of_other_hotel': BookingFailureReason.OTHER_HOTEL_ROOM,
    'booking.check_in_in_past': BookingFailureReason.CHECK_IN_IN_PAST,
});

/** Stay problems (whole-request codes) → violation of the stay picker. */
const STAY_RULE_BY_CODE = Object.freeze({
    'booking.check_in_in_past': StayRuleError.CHECK_IN_IN_PAST,
    'booking.check_out_not_after_check_in': StayRuleError.CHECK_OUT_NOT_AFTER_CHECK_IN,
});

const DATE_FIELDS = Object.freeze(['checkInDate', 'checkOutDate', 'checkIn', 'checkOut']);

/**
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {string|null}
 */
export function classifyBookingProblem(problem) {
    return REASON_BY_CODE[problem.code] ?? null;
}

/**
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string}>} Violation per form field (`guestName`, `guestEmail`, `guestPhone`, `roomId`, `stay`).
 */
export function bookingFieldViolations(problem) {
    const violations = {};
    if (problem.violationOf('guestName')) violations.guestName = { code: BookingRuleError.GUEST_NAME };
    if (problem.violationOf('guestEmail')) violations.guestEmail = { code: BookingRuleError.GUEST_EMAIL };
    if (problem.violationOf('guestPhone')) violations.guestPhone = { code: BookingRuleError.GUEST_PHONE };
    if (problem.violationOf('roomId')) violations.roomId = { code: BookingRuleError.ROOM_REQUIRED };

    const stayRule = STAY_RULE_BY_CODE[problem.code];
    if (stayRule) violations.stay = { code: stayRule };
    else if (DATE_FIELDS.some((field) => problem.violationOf(field))) violations.stay = { code: StayRuleError.DATES_REQUIRED };
    return violations;
}
