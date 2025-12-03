// src/bounded-contexts/payments/domain/types/payment.types.js

/**
 * @typedef {Object} PaymentResource
 * @property {number} id
 * @property {number} bookingId
 * @property {number} amount - decimal
 * @property {string} paymentMethod
 * @property {string} status - "Pending" | "Processed" | "Failed" | "Refunded"
 * @property {string} paymentDate - ISO 8601 DateTime
 * @property {string|null} invoiceNumber
 */

/**
 * @typedef {Object} CreatePaymentResource
 * @property {number} bookingId
 * @property {number} amount - decimal
 * @property {string} paymentMethod
 */

export const PaymentStatus = {
    Pending: 'Pending',
    Processed: 'Processed',
    Failed: 'Failed',
    Refunded: 'Refunded'
};

export {};

