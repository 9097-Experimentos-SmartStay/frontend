import { BaseApi } from '@/shared/infrastructure/services/base-api.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';

const bookingsPath = endpoints.bookings;
const paymentsPath = endpoints.payments;

/**
 * Payments (§9). The hotel registers the payments it receives; the API never receives card data.
 */
export class PaymentApi extends BaseApi {
    /**
     * POST /bookings/{bookingId}/payments {method, operationNumber?, note?} → 201 PaymentResource; the booking
     * becomes Confirmed. 409 already paid / not pending, 403 booking of another hotel.
     * @param {number} bookingId
     * @param {Object} resource - Built by PaymentAssembler.toRegisterResource.
     */
    registerPayment(bookingId, resource) {
        return this.http.post(`${bookingsPath}/${bookingId}/payments`, resource);
    }

    /**
     * GET /payments/booking/{bookingId}: the completed (or refunded) payment, or the latest attempt. 404 = none yet.
     * @param {number} bookingId
     */
    getPaymentByBookingId(bookingId) {
        return this.http.get(`${paymentsPath}/booking/${bookingId}`);
    }
}
