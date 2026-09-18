/** Business reasons of the booking use cases (US-51, US-07), carried by an OperationFailure. */
export const BookingFailureReason = Object.freeze({
    /** 409: another booking took some of those nights, or the room went into maintenance (US-51 scenario 3). */
    ROOM_UNAVAILABLE: 'roomUnavailable',
    /** 409: a paid booking can only change to a stay with the same total (§8.3). */
    PAID_TOTAL_MISMATCH: 'paidTotalMismatch',
    /** 409: cancellation on or after the check-in day (§8.4). */
    CHECK_IN_DAY_REACHED: 'checkInDayReached',
    /** 409: only Pending or Confirmed bookings can be cancelled or changed. */
    NOT_CHANGEABLE: 'notChangeable',
    /** 400: the new room belongs to another hotel. */
    OTHER_HOTEL_ROOM: 'otherHotelRoom',
    /** 400: check-in before today (hotel time). */
    CHECK_IN_IN_PAST: 'checkInInPast',
    /** 409: the hotel has no payment methods yet, so it does not accept bookings (US-53). */
    HOTEL_NOT_ACCEPTING_BOOKINGS: 'hotelNotAcceptingBookings',
});
