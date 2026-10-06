import { BaseApi } from '@/shared/infrastructure/services/base-api.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';

const bookingsPath = endpoints.bookings;
const paymentsPath = endpoints.payments;

/**
 * Payments (§9). The hotel registers the payments it receives; a guest can also pay online with a card, which the
 * API charges through its simulated gateway without storing it.
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
     * POST /bookings/{bookingId}/payments/card {cardNumber, cardHolderName, expiryMonth, expiryYear, cvv} → 201
     * PaymentResource; the booking becomes Confirmed. Guests only, own Pending booking (404 otherwise).
     * 409 payment.card_declined (the guest can retry), 409 already paid / not pending, 400 per card field.
     * The gateway is simulated: no money moves and the card is never stored.
     * @param {number} bookingId
     * @param {Object} resource - Built by PaymentAssembler.toCardResource.
     */
    payWithCard(bookingId, resource) {
        return this.http.post(`${bookingsPath}/${bookingId}/payments/card`, resource);
    }

    /**
     * GET /payments/booking/{bookingId}: the completed (or refunded) payment, or the latest attempt. 404 = none yet.
     * @param {number} bookingId
     */
    getPaymentByBookingId(bookingId) {
        return this.http.get(`${paymentsPath}/booking/${bookingId}`);
    }
}
