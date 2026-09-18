import { defineStore } from 'pinia';
import { ref } from 'vue';
import { PaymentApi } from '../infrastructure/api/payment-api.js';
import { PaymentAssembler } from '../infrastructure/payment.assembler.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const paymentApi = new PaymentApi();

/**
 * Pinia Store for Payment Management.
 * Handles state management and business logic for Payments.
 * @returns {Object} The payment store composable with state and actions.
 */
export const usePaymentStore = defineStore('payment', () => {

    /**
     * @type {import('vue').Ref<Payment|null>} currentPayment - The currently selected payment.
     */
    const currentPayment = ref(null);
    /**
     * @type {import('vue').Ref<boolean>} loading - Indicates if an operation is in progress.
     */
    const loading = ref(false);
    /**
     * @type {import('vue').Ref<Error|null>} error - The last error encountered.
     */
    const error = ref(null);

    // --- Actions ---

    /**
     * Processes a payment.
     * @param {Object} paymentData - The data for the payment.
     * @param {number} paymentData.bookingId - The booking identifier.
     * @param {number} paymentData.amount - The payment amount.
     * @param {string} paymentData.paymentMethod - The payment method.
     * @returns {Promise<Payment>} The processed payment entity.
     */
    async function processPayment(paymentData) {
        loading.value = true;
        error.value = null;
        try {
            const response = await paymentApi.processPayment(paymentData);
            currentPayment.value = PaymentAssembler.toEntityFromResponse(response);
            return currentPayment.value;
        } catch (err) {
            reportError('Error processing payment', err);
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetches a payment by booking ID.
     * @param {number} bookingId - The booking identifier.
     * @returns {Promise<Payment|null>} The payment entity or null if not found.
     */
    async function fetchPaymentByBooking(bookingId) {
        loading.value = true;
        try {
            const response = await paymentApi.getPaymentByBookingId(bookingId);
            currentPayment.value = PaymentAssembler.toEntityFromResponse(response);
            return currentPayment.value;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                currentPayment.value = null; // Estado limpio
                return null;
            }
            reportError('Error fetching payment', err);
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        currentPayment,
        loading,
        error,
        processPayment,
        fetchPaymentByBooking
    };
});