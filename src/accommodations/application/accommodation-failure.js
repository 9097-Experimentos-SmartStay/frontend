/** Business reasons of the hotel and room setup use cases (US-53), carried by an OperationFailure. */
export const AccommodationFailureReason = Object.freeze({
    /** 409: the room number already exists in the hotel. */
    DUPLICATE_ROOM_NUMBER: 'duplicateRoomNumber',
    /** 409: the room (or a room of the hotel) still has pending, confirmed or checked-in bookings. */
    HAS_ACTIVE_BOOKINGS: 'hasActiveBookings',
    /** 409: an admin manages a single hotel and already has one (D2). */
    HOTEL_ALREADY_REGISTERED: 'hotelAlreadyRegistered',
    /** 409: the room cannot move from its current status to the requested one (US-29, US-06). */
    INVALID_STATUS_TRANSITION: 'invalidStatusTransition',
});
