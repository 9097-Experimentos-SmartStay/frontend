// src/bounded-contexts/payments/application/payment-service.js
import { PaymentRepository } from '../infrastructure/repositories/payment-repository.js';
import { BookingService } from '../../bookings/application/booking-service.js';

export class PaymentService {
    constructor() {
        this.repository = new PaymentRepository();
        this.bookingService = new BookingService();
    }

    async getAllPayments() {
        return await this.repository.getAll();
    }

    async getPaymentById(id) {
        return await this.repository.getById(id);
    }

    async getPaymentsByBooking(bookingId) {
        // Validar que la reserva existe
        await this.bookingService.getBookingById(bookingId);
        return await this.repository.getByBookingId(bookingId);
    }

    async createPayment(data) {
        // Validaciones de dominio
        if (!data.bookingId) {
            throw new Error('bookingId is required');
        }
        if (!data.amount || data.amount <= 0) {
            throw new Error('amount must be greater than 0');
        }
        if (!data.paymentMethod) {
            throw new Error('paymentMethod is required');
        }

        // Validar que la reserva existe y está confirmada
        const booking = await this.bookingService.getBookingById(data.bookingId);
        if (!booking.isConfirmed()) {
            throw new Error('Payment can only be created for confirmed bookings');
        }

        return await this.repository.create(data);
    }

    async processPayment(id, invoiceNumber = null) {
        const payment = await this.repository.getById(id);
        if (!payment.isPending()) {
            throw new Error('Only pending payments can be processed');
        }
        return await this.repository.process(id, invoiceNumber);
    }

    async failPayment(id) {
        const payment = await this.repository.getById(id);
        if (!payment.isPending()) {
            throw new Error('Only pending payments can be marked as failed');
        }
        return await this.repository.fail(id);
    }
}

