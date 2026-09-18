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
    /** 503: the API has no image hosting configured (`media.uploads_not_configured`). */
    IMAGE_UPLOADS_NOT_CONFIGURED: 'imageUploadsNotConfigured',
    /** The image service rejected the file or could not be reached. */
    IMAGE_UPLOAD_REJECTED: 'imageUploadRejected',
    /** The file is not a JPG, PNG or WebP image. */
    IMAGE_TYPE_NOT_ALLOWED: 'imageTypeNotAllowed',
    /** The file is larger than 10 MB. */
    IMAGE_TOO_LARGE: 'imageTooLarge',
});
