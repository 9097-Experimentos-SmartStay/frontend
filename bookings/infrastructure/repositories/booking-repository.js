// src/bounded-contexts/bookings/infrastructure/repositories/booking-repository.js
import { bookingApi } from '../api/booking-api.js';
import { Booking } from '../../domain/model/booking.entity.js';

export class BookingRepository {
    async getAll() {
        const resources = await bookingApi.getAll();
        return resources.map(resource => Booking.fromResource(resource));
    }

    async getById(id) {
        const resource = await bookingApi.getById(id);
        return Booking.fromResource(resource);
    }

    async getByRoomId(roomId) {
        const resources = await bookingApi.getByRoomId(roomId);
        return resources.map(resource => Booking.fromResource(resource));
    }

    async create(data) {
        const resource = await bookingApi.create(data);
        return Booking.fromResource(resource);
    }

    async confirm(id) {
        const resource = await bookingApi.confirm(id);
        return Booking.fromResource(resource);
    }

    async cancel(id) {
        const resource = await bookingApi.cancel(id);
        return Booking.fromResource(resource);
    }
}

