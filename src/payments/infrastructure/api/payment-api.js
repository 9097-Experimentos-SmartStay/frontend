import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";
import { endpoints } from "@/shared/infrastructure/config/api-config.js";

const paymentsEndpointPath = endpoints.payments;

export class PaymentApi extends BaseApi {
    #endpoint;

    constructor() {
        super();
        this.#endpoint = new BaseEndpoint(this, paymentsEndpointPath);
    }

    /**
     * Procesa un nuevo pago.
     * POST /api/v1/payments
     */
    processPayment(paymentResource) {
        // Usamos el endpoint base para crear
        return this.#endpoint.create(paymentResource);
    }

    /**
     * Obtiene el pago asociado a una reserva.
     * GET /api/v1/payments/booking/{bookingId}
     */
    getPaymentByBookingId(bookingId) {
        return this.http.get(`${paymentsEndpointPath}/booking/${bookingId}`);
    }
}