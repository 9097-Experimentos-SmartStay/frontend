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
            method: resource.method ?? resource.paymentMethod ?? null,
            cardNumberMasked: resource.cardNumberMasked ?? null,
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
     * Body of the staff payment registration. PROVISIONAL shape until the backend publishes the
     * contract (audit/09-frontend-gaps.md); adapt only this method when it does.
     * @param {import('../domain/commands/register-payment.command.js').RegisterPaymentCommand} command
     * @returns {Object}
     */
    static toRegisterResource(command) {
        const resource = { bookingId: command.bookingId, method: command.method };
        if (command.operationNumber) resource.operationNumber = command.operationNumber;
        if (command.note) resource.note = command.note;
        return resource;
    }
}
