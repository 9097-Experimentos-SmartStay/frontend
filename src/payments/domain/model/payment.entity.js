import { Money } from '@/shared/domain/money.js';

/** Payment status strings of the API (§9). */
export const PaymentStatus = Object.freeze({
    COMPLETED: 'Completed',
    /** Only if a future online gateway rejects a payment. */
    FAILED: 'Failed',
    /** Its booking was cancelled: the hotel returns the money outside the system. */
    REFUNDED: 'Refunded',
});

/**
 * A payment registered by the hotel (PaymentResource, §9). The amount is always the booking total (snapshot).
 */
export class Payment {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {number} params.bookingId
     * @param {string|null} params.transactionId
     * @param {Money} params.amount
     * @param {string} params.status - One of {@link PaymentStatus}.
     * @param {string|null} params.method - One of PaymentMethod.
     * @param {string|null} params.operationNumber - Yape/Plin/transfer/card operation number (none for cash).
     * @param {string|null} params.note
     * @param {number|null} params.recordedByUserId
     * @param {Date|null} params.paymentDate
     * @param {Date|null} params.refundedAt
     */
    constructor({ id, bookingId, transactionId, amount, status, method, operationNumber, note, recordedByUserId, paymentDate, refundedAt }) {
        this.id = id;
        this.bookingId = bookingId;
        this.transactionId = transactionId ?? null;
        this.amount = amount ?? Money.zero();
        this.status = status;
        this.method = method ?? null;
        this.operationNumber = operationNumber ?? null;
        this.note = note ?? null;
        this.recordedByUserId = recordedByUserId ?? null;
        this.paymentDate = paymentDate ?? null;
        this.refundedAt = refundedAt ?? null;
        Object.freeze(this);
    }

    /** @returns {boolean} The booking is confirmed by this payment. */
    isCompleted() {
        return this.status === PaymentStatus.COMPLETED;
    }

    /** @returns {boolean} */
    isRefunded() {
        return this.status === PaymentStatus.REFUNDED;
    }

    /** @returns {boolean} */
    isFailed() {
        return this.status === PaymentStatus.FAILED;
    }
}
