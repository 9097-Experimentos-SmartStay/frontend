import { Payment } from '../domain/model/payment.entity.js';

/**
 * `paymentDate` is "yyyy-MM-dd HH:mm:ss" in UTC (not ISO): read it as UTC.
 * @param {string|null} value
 * @returns {Date|null}
 */
function parseUtcTimestamp(value) {
    if (!value) return null;
    const iso = /[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value.replace(' ', 'T') : `${value.replace(' ', 'T')}Z`;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * PaymentResource (§9) ↔ {@link Payment}.
 */
export class PaymentAssembler {
    /**
     * @param {Object} resource
     * @returns {Payment|null}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new Payment({
            id: resource.id,
            bookingId: resource.bookingId,
            transactionId: resource.transactionId,
            amount: resource.amount,
            status: resource.status,
            cardNumberMasked: resource.cardNumberMasked,
            paymentDate: parseUtcTimestamp(resource.paymentDate),
        });
    }

    /**
     * @param {Object} response - Axios response.
     * @returns {Payment|null}
     */
    static toEntityFromResponse(response) {
        return PaymentAssembler.toEntityFromResource(response?.data);
    }

    /**
     * Body of POST /payments. `amount` is not sent: the backend computes it.
     * @param {import('../domain/commands/pay-booking.command.js').PayBookingCommand} command
     * @returns {Object}
     */
    static toCreateResource(command) {
        return {
            bookingId: command.bookingId,
            paymentMethod: command.paymentMethod,
            cardNumber: command.cardNumber,
            cardHolderName: command.cardHolderName,
            expirationDate: command.expirationDate,
            cvv: command.cvv,
        };
    }
}
