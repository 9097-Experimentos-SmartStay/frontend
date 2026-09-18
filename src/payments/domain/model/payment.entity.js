/** Payment status strings the API returns (§9). `Pending` only exists inside the backend. */
export const PaymentStatus = Object.freeze({
    COMPLETED: 'Completed',
    FAILED: 'Failed',
});

/**
 * Payment Domain Entity (PaymentResource, §9).
 * The amount is computed by the backend: room price per night × nights of the booking.
 * @class
 */
export class Payment {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {number} params.bookingId
     * @param {string} params.transactionId
     * @param {number} params.amount - Charged by the backend.
     * @param {string} params.status - One of {@link PaymentStatus}.
     * @param {string|null} [params.method] - How it was paid (Yape, Plin, transfer, cash, card).
     * @param {string|null} [params.cardNumberMasked] - Only for card payments.
     * @param {Date|null} params.paymentDate
     */
    constructor({ id, bookingId, transactionId, amount, status, method = null, cardNumberMasked = null, paymentDate }) {
        this.id = id;
        this.bookingId = bookingId;
        this.transactionId = transactionId;
        this.amount = Number(amount ?? 0);
        this.status = status;
        this.method = method;
        this.cardNumberMasked = cardNumberMasked;
        this.paymentDate = paymentDate;
    }

    /** @returns {boolean} Approved: the booking became Confirmed in the same transaction. */
    isCompleted() {
        return this.status === PaymentStatus.COMPLETED;
    }

    /** @returns {boolean} Declined card (the response is still 201); the booking can be paid again. */
    isFailed() {
        return this.status === PaymentStatus.FAILED;
    }
}
