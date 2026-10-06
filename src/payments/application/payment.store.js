import { defineStore } from 'pinia';
import { ref } from 'vue';
import { PaymentApi } from '../infrastructure/api/payment-api.js';
import { PaymentAssembler } from '../infrastructure/payment.assembler.js';
import { cardPaymentFieldViolations, classifyPaymentProblem, paymentFieldViolations } from '../infrastructure/payment-problem.assembler.js';
import { OperationFailure } from '@/shared/application/operation-failure.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const paymentApi = new PaymentApi();

/**
 * Payments (§9, D1). Guests pay outside the app (Yape, Plin, transfer, or cash/card at the front desk) and the
 * hotel registers the payment, which confirms the booking. The amount is always the booking total.
 */
export const usePaymentStore = defineStore('payment', () => {
    /** @type {import('vue').Ref<import('../domain/model/payment.entity.js').Payment|null>} */
    const currentPayment = ref(null);
    /** @type {import('vue').Ref<import('../domain/model/payment.entity.js').Payment[]>} */
    const payments = ref([]);
    const loading = ref(false);
    const registering = ref(false);
    const paying = ref(false);
    const error = ref(null);

    /**
     * US-07 scenario 5: registers the payment of a Pending booking; the backend confirms it and e-mails the guest.
     * @param {import('../domain/commands/register-payment.command.js').RegisterPaymentCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/payment.entity.js').Payment|null>}
     * @throws {OperationFailure} alreadyPaid | bookingNotPending | invalidData (per field) | forbidden | notFound
     */
    async function registerPayment(command) {
        registering.value = true;
        try {
            const response = await paymentApi.registerPayment(command.bookingId, PaymentAssembler.toRegisterResource(command));
            currentPayment.value = PaymentAssembler.toEntityFromResponse(response);
            return currentPayment.value;
        } catch (err) {
            reportError('Error registering payment', err);
            throw OperationFailure.from(err, { classify: classifyPaymentProblem, fields: paymentFieldViolations });
        } finally {
            registering.value = false;
        }
    }

    /**
     * The guest pays their own Pending booking with a card (simulated gateway); approved, the booking is Confirmed.
     * @param {import('../domain/commands/pay-with-card.command.js').PayWithCardCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/payment.entity.js').Payment|null>}
     * @throws {OperationFailure} cardDeclined | alreadyPaid | bookingNotPending | invalidData (per field) | notFound
     */
    async function payWithCard(command) {
        paying.value = true;
        try {
            const response = await paymentApi.payWithCard(command.bookingId, PaymentAssembler.toCardResource(command));
            currentPayment.value = PaymentAssembler.toEntityFromResponse(response);
            return currentPayment.value;
        } catch (err) {
            // Only the masked error goes to the log: the request body (the card) is never reported.
            reportError('Error paying a booking with a card', err?.response?.status ?? err?.message);
            throw OperationFailure.from(err, { classify: classifyPaymentProblem, fields: cardPaymentFieldViolations });
        } finally {
            paying.value = false;
        }
    }

    /**
     * GET /payments/booking/{id}: the completed (or refunded) payment, or the latest attempt. 404 = not paid yet.
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
            error.value = OperationFailure.from(err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * There is no endpoint that lists payments (§9): the payment of each booking is requested.
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
                error.value = OperationFailure.from(failure.reason);
            }
        } finally {
            loading.value = false;
        }
    }

    return {
        currentPayment,
        payments,
        loading,
        registering,
        paying,
        error,
        registerPayment,
        payWithCard,
        fetchPaymentByBooking,
        fetchPaymentsForBookings,
    };
});
