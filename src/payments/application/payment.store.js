import { defineStore } from 'pinia';
import { ref } from 'vue';
import { PaymentApi } from '../infrastructure/api/payment-api.js';
import { PaymentAssembler } from '../infrastructure/payment.assembler.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const paymentApi = new PaymentApi();

/**
 * Pinia Store for Payment Management.
 * The amount of a payment is always the one returned by the backend (never computed here).
 * Guests do not pay inside the app: reception registers the payment (Yape, Plin, transfer, cash, card at reception).
 */
export const usePaymentStore = defineStore('payment', () => {
    /** @type {import('vue').Ref<import('../domain/model/payment.entity.js').Payment|null>} */
    const currentPayment = ref(null);
    /** @type {import('vue').Ref<Array<import('../domain/model/payment.entity.js').Payment>>} */
    const payments = ref([]);
    const loading = ref(false);
    const error = ref(null);

    /** The staff registration endpoint is not in the API contract yet (see api-config.js). */
    const canRegisterPayments = paymentApi.supportsRegistration;

    /**
     * Staff registers the payment of a pending booking; the backend computes the amount and
     * confirms the booking.
     * @param {import('../domain/commands/register-payment.command.js').RegisterPaymentCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/payment.entity.js').Payment|null>}
     * @throws The HTTP error (404 booking, 409 already paid or cancelled, 400 invalid data).
     */
    async function registerPayment(command) {
        loading.value = true;
        error.value = null;
        try {
            const response = await paymentApi.registerPayment(PaymentAssembler.toRegisterResource(command));
            currentPayment.value = PaymentAssembler.toEntityFromResponse(response);
            return currentPayment.value;
        } catch (err) {
            reportError('Error registering payment', err);
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * GET /payments/booking/{id}: the completed payment, or the latest attempt. 404 = not paid yet.
     * @param {number} bookingId
     * @returns {Promise<import('../domain/model/payment.entity.js').Payment|null>}
     */
    async function fetchPaymentByBooking(bookingId) {
        loading.value = true;
        try {
            currentPayment.value = PaymentAssembler.toEntityFromResponse(await paymentApi.getPaymentByBookingId(bookingId));
            return currentPayment.value;
        } catch (err) {
            currentPayment.value = null;
            if (err?.response?.status === 404) return null;
            reportError('Error fetching payment', err);
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * There is no endpoint that lists every payment (§9): the staff view asks for the payment of each booking.
     * Bookings without a payment (404) are skipped.
     * @param {number[]} bookingIds
     * @returns {Promise<void>}
     */
    async function fetchPaymentsForBookings(bookingIds) {
        loading.value = true;
        error.value = null;
        try {
            const results = await Promise.allSettled(bookingIds.map((id) => paymentApi.getPaymentByBookingId(id)));
            payments.value = results
                .filter((result) => result.status === 'fulfilled')
                .map((result) => PaymentAssembler.toEntityFromResponse(result.value))
                .filter(Boolean);
            const failure = results.find((result) => result.status === 'rejected' && result.reason?.response?.status !== 404);
            if (failure) {
                reportError('Error fetching payments', failure.reason);
                error.value = failure.reason;
            }
        } finally {
            loading.value = false;
        }
    }

    return {
        currentPayment,
        payments,
        loading,
        error,
        canRegisterPayments,
        registerPayment,
        fetchPaymentByBooking,
        fetchPaymentsForBookings,
    };
});
