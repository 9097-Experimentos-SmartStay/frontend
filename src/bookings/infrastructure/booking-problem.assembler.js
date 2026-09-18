import { BookingFailureReason } from '../application/booking-failure.js';
import { BookingRuleError } from '../domain/commands/create-booking.command.js';
import { StayRuleError } from '../domain/model/stay-period.js';

/**
 * Anti-corruption layer for the errors of /bookings and /rooms/available (§5, §8.1–§8.4).
 * Turns the English `detail` into business reasons and the per-field `errors` into the rule codes of the forms.
 */

/**
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {string|null}
 */
export function classifyBookingProblem(problem) {
    const { status } = problem;
    if (status === 409) {
        if (problem.detailIncludes('already paid') && problem.detailIncludes('same total')) return BookingFailureReason.PAID_TOTAL_MISMATCH;
        if (problem.detailIncludes('no longer available') || problem.detailIncludes('not available') || problem.detailIncludes('under maintenance')) {
            return BookingFailureReason.ROOM_UNAVAILABLE;
        }
        if (problem.detailIncludes('on or after its check-in day')) return BookingFailureReason.CHECK_IN_DAY_REACHED;
        if (problem.detailIncludes('only pending or confirmed')) return BookingFailureReason.NOT_CHANGEABLE;
    }
    if (status === 400) {
        if (problem.detailIncludes('room of the same hotel')) return BookingFailureReason.OTHER_HOTEL_ROOM;
        if (problem.detailIncludes('in the past')) return BookingFailureReason.CHECK_IN_IN_PAST;
    }
    return null;
}

/**
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string}>} Violation per form field (`guestName`, `guestEmail`, `guestPhone`, `roomId`, `stay`).
 */
export function bookingFieldViolations(problem) {
    const violations = {};
    const text = (field) => (problem.fieldErrors[field] ?? []).join(' ');
    if (text('guestName')) violations.guestName = { code: BookingRuleError.GUEST_NAME };
    if (text('guestEmail')) violations.guestEmail = { code: BookingRuleError.GUEST_EMAIL };
    if (text('guestPhone')) violations.guestPhone = { code: BookingRuleError.GUEST_PHONE };
    if (text('roomId')) violations.roomId = { code: BookingRuleError.ROOM_REQUIRED };
    const dates = `${text('checkInDate')} ${text('checkOutDate')} ${text('checkIn')} ${text('checkOut')} ${problem.detail}`;
    if (/in the past/i.test(dates)) violations.stay = { code: StayRuleError.CHECK_IN_IN_PAST };
    else if (/at least one day after/i.test(dates)) violations.stay = { code: StayRuleError.CHECK_OUT_NOT_AFTER_CHECK_IN };
    else if (/not provided|required/i.test(dates) && problem.status === 400) violations.stay = { code: StayRuleError.DATES_REQUIRED };
    return violations;
}
