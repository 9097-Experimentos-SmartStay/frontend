import { Booking } from '../../domain/model/booking.entity.js';
import { BookingApi } from '../api/booking-api.js';

export class BookingRepository {
    constructor() {
        this.api = new BookingApi();
    }

    async getAll() {
        const response = await this.api.getAllBookings();
        const resources = response.data;
        return resources.map(resource => Booking.fromResource(resource));
    }

    async getById(id) {
        const response = await this.api.getBookingById(id);
        const resource = response.data;
        return Booking.fromResource(resource);
    }

    async getByRoomId(roomId) {
        const response = await this.api.getBookingsByRoomId(roomId);
        const resources = response.data;
        return resources.map(resource => Booking.fromResource(resource));
    }

    async create(data) {
        const response = await this.api.createBooking(data);
        const resource = response.data;
        return Booking.fromResource(resource);
    }

    async confirm(id) {
        const response = await this.api.confirmBooking(id);
        const resource = response.data;
        return Booking.fromResource(resource);
    }

    async cancel(id) {
        const response = await this.api.cancelBooking(id);
        const resource = response.data;
        return Booking.fromResource(resource);
    }
}