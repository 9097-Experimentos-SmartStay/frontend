// src/bounded-contexts/payments/domain/model/payment.entity.js

/**
 * Payment Domain Entity.
 * Represents a payment in the business domain.
 * @class
 */
export class Payment {
    /**
     * Creates an instance of Payment.
     * @param {Object} params - The parameters for creating the payment.
     * @param {number} params.id - The unique identifier of the payment.
     * @param {number} params.bookingId - The identifier of the associated booking.
     * @param {number} params.amount - The payment amount.
     * @param {string} params.paymentMethod - The method of payment.
     * @param {string} [params.status='Pending'] - The status of the payment.
     * @param {Date|string} params.paymentDate - The date of the payment.
     * @param {string} params.invoiceNumber - The invoice number.
     */
    constructor({ id, bookingId, amount, paymentMethod, status, paymentDate, invoiceNumber }) {
        /**
         * @property {number} id - The unique identifier of the payment.
         */
        this.id = id;
        /**
         * @property {number} bookingId - The identifier of the associated booking.
         */
        this.bookingId = bookingId;
        /**
         * @property {number} amount - The payment amount.
         */
        this.amount = amount;
        /**
         * @property {string} paymentMethod - The method of payment.
         */
        this.paymentMethod = paymentMethod;
        /**
         * @property {string} status - The status of the payment.
         */
        this.status = status || 'Pending';
        /**
         * @property {Date|null} paymentDate - The date of the payment.
         */
        this.paymentDate = paymentDate ? new Date(paymentDate) : null;
        /**
         * @property {string|null} invoiceNumber - The invoice number.
         */
        this.invoiceNumber = invoiceNumber || null;
    }

    /**
     * Creates a Payment instance from a resource object.
     * @param {Object} resource - The resource object to convert from.
     * @param {number} resource.id - The unique identifier.
     * @param {number} resource.bookingId - The booking identifier.
     * @param {number} resource.amount - The amount.
     * @param {string} resource.paymentMethod - The payment method.
     * @param {string} resource.status - The status.
     * @param {Date|string} resource.paymentDate - The payment date.
     * @param {string} resource.invoiceNumber - The invoice number.
     * @returns {Payment} A new Payment instance.
     */
    static fromResource(resource) {
        return new Payment({
            id: resource.id,
            bookingId: resource.bookingId,
            amount: resource.amount,
            paymentMethod: resource.paymentMethod,
            status: resource.status,
            paymentDate: resource.paymentDate,
            invoiceNumber: resource.invoiceNumber
        });
    }

    /**
     * Checks if the payment is pending.
     * @returns {boolean} True if the status is 'Pending'.
     */
    isPending() {
        return this.status === 'Pending';
    }

    /**
     * Checks if the payment is processed.
     * @returns {boolean} True if the status is 'Processed'.
     */
    isProcessed() {
        return this.status === 'Processed';
    }

    /**
     * Checks if the payment failed.
     * @returns {boolean} True if the status is 'Failed'.
     */
    isFailed() {
        return this.status === 'Failed';
    }

    /**
     * Checks if the payment is refunded.
     * @returns {boolean} True if the status is 'Refunded'.
     */
    isRefunded() {
        return this.status === 'Refunded';
    }
}
