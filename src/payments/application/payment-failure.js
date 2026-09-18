/** Business reasons of the payment registration (US-07 scenario 5), carried by an OperationFailure. */
export const PaymentFailureReason = Object.freeze({
    /** 409: someone registered the payment already. */
    ALREADY_PAID: 'alreadyPaid',
    /** 409: the booking is cancelled (or expired): only a pending booking can be paid. */
    BOOKING_NOT_PENDING: 'bookingNotPending',
});
