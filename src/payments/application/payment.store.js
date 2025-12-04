import { defineStore } from 'pinia';
import { ref } from 'vue';
import { PaymentApi } from '../infrastructure/api/payment-api.js';
import { PaymentAssembler } from '../infrastructure/payment.assembler.js';

const paymentApi = new PaymentApi();

export const usePaymentStore = defineStore('payment', () => {

    const currentPayment = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // --- Actions ---

    async function processPayment(paymentData) {
        loading.value = true;
        error.value = null;
        try {
            const response = await paymentApi.processPayment(paymentData);
            currentPayment.value = PaymentAssembler.toEntityFromResponse(response);
            return currentPayment.value;
        } catch (err) {
            console.error('Error processing payment:', err);
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function fetchPaymentByBooking(bookingId) {
        loading.value = true;
        try {
            const response = await paymentApi.getPaymentByBookingId(bookingId);
            currentPayment.value = PaymentAssembler.toEntityFromResponse(response);
            return currentPayment.value;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                console.log(`No payment found for booking ${bookingId}. User needs to pay.`);
                currentPayment.value = null; // Estado limpio
                return null;
            }
            console.error('Error fetching payment:', err);
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