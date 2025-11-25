// src/bounded-contexts/payments/domain/model/payment.entity.js

export class Payment {
    constructor({ id, bookingId, amount, paymentMethod, status, paymentDate, invoiceNumber }) {
        this.id = id;
        this.bookingId = bookingId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status || 'Pending';
        this.paymentDate = paymentDate ? new Date(paymentDate) : null;
        this.invoiceNumber = invoiceNumber || null;
    }

    static fromResource(resource) {
        return new Payment({
            id: resource.id,
            bookingId: resource.bookingId,
            amount: resource.amount,
            paymentMethod: resource.paymentMethod,
            status: resource.status,
            paymentDate: resource.paymentDate,
            invoiceNumber: resource.invoiceNumber
        });
    }

    isPending() {
        return this.status === 'Pending';
    }

    isProcessed() {
        return this.status === 'Processed';
    }

    isFailed() {
        return this.status === 'Failed';
    }

    isRefunded() {
        return this.status === 'Refunded';
    }
}

