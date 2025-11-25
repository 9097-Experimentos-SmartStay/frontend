// src/bounded-contexts/payments/infrastructure/repositories/payment-repository.js
import { paymentApi } from '../api/payment-api.js';
import { Payment } from '../../domain/model/payment.entity.js';

export class PaymentRepository {
    async getAll() {
        const resources = await paymentApi.getAll();
        return resources.map(resource => Payment.fromResource(resource));
    }

    async getById(id) {
        const resource = await paymentApi.getById(id);
        return Payment.fromResource(resource);
    }

    async getByBookingId(bookingId) {
        const resources = await paymentApi.getByBookingId(bookingId);
        return resources.map(resource => Payment.fromResource(resource));
    }

    async create(data) {
        const resource = await paymentApi.create(data);
        return Payment.fromResource(resource);
    }

    async process(id, invoiceNumber = null) {
        const resource = await paymentApi.process(id, invoiceNumber);
        return Payment.fromResource(resource);
    }

    async fail(id) {
        const resource = await paymentApi.fail(id);
        return Payment.fromResource(resource);
    }
}

