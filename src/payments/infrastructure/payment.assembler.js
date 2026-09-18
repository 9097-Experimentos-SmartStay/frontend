import { Payment } from '../domain/model/payment.entity.js';
import { Money } from '@/shared/domain/money.js';

/**
 * `paymentDate` is "yyyy-MM-dd HH:mm:ss" in UTC (not ISO): read it as UTC. Other instants are ISO with offset.
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
            amount: Money.from(resource.amount),
            status: resource.status,
            method: resource.method,
            operationNumber: resource.operationNumber,
            note: resource.note,
            recordedByUserId: resource.recordedByUserId,
            paymentDate: parseUtcTimestamp(resource.paymentDate),
            refundedAt: parseUtcTimestamp(resource.refundedAt),
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
     * Body of POST /bookings/{id}/payments. No amount: the backend always charges the booking total.
     * @param {import('../domain/commands/register-payment.command.js').RegisterPaymentCommand} command
     * @returns {{method: string, operationNumber?: string, note?: string}}
     */
    static toRegisterResource(command) {
        const resource = { method: command.method };
        if (command.operationNumber) resource.operationNumber = command.operationNumber;
        if (command.note) resource.note = command.note;
        return resource;
    }
}
