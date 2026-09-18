import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { endpoints } from "@/shared/infrastructure/config/api-config.js";

const paymentsEndpointPath = endpoints.payments;
const registrationEndpointPath = endpoints.paymentRegistration;

/**
 * Payments (§9). Guests no longer pay with a card inside the app: reception registers the payment.
 */
export class PaymentApi extends BaseApi {
    /** @returns {boolean} True when the payment registration endpoint is configured (contract pending). */
    get supportsRegistration() {
        return !!registrationEndpointPath;
    }

    /**
     * Registers a payment made by Yape, Plin, transfer, cash or card at reception.
     * @param {Object} resource - Built by PaymentAssembler.toRegisterResource.
     * @returns {Promise<Object>} Axios response.
     */
    registerPayment(resource) {
        if (!registrationEndpointPath) {
            return Promise.reject(new Error('Payment registration endpoint is not configured'));
        }
        return this.http.post(registrationEndpointPath, resource);
    }

    /**
     * GET /payments/booking/{bookingId}: the completed payment, or the latest attempt. 404 = none yet.
     * @param {number} bookingId
     * @returns {Promise<Object>} Axios response.
     */
    getPaymentByBookingId(bookingId) {
        return this.http.get(`${paymentsEndpointPath}/booking/${bookingId}`);
    }
}
