// src/bounded-contexts/bookings/application/booking-service.js
import { BookingRepository } from '../infrastructure/repositories/booking-repository.js';
import { RoomService } from '../../accommodations/application/room-service.js';

export class BookingService {
    constructor() {
        this.repository = new BookingRepository();
        this.roomService = new RoomService();
    }

    async getAllBookings() {
        return await this.repository.getAll();
    }

    async getBookingById(id) {
        return await this.repository.getById(id);
    }

    async getBookingsByRoom(roomId) {
        // Validar que la habitación existe
        await this.roomService.getRoomById(roomId);
        return await this.repository.getByRoomId(roomId);
    }

    async createBooking(data) {
        // Validaciones de dominio
        if (!data.roomId) {
            throw new Error('roomId is required');
        }
        if (!data.guestName || !data.guestEmail) {
            throw new Error('guestName and guestEmail are required');
        }
        if (!data.checkInDate || !data.checkOutDate) {
            throw new Error('checkInDate and checkOutDate are required');
        }

        // Validar fechas
        const checkIn = new Date(data.checkInDate);
        const checkOut = new Date(data.checkOutDate);
        
        if (checkIn >= checkOut) {
            throw new Error('checkOutDate must be after checkInDate');
        }

        if (checkIn < new Date()) {
            throw new Error('checkInDate cannot be in the past');
        }

        // Validar que la habitación existe
        await this.roomService.getRoomById(data.roomId);

        // Validar disponibilidad (verificar conflictos con otras reservas)
        const existingBookings = await this.repository.getByRoomId(data.roomId);
        const hasConflict = existingBookings.some(booking => {
            if (booking.isCancelled()) return false;
            const existingCheckIn = booking.checkInDate instanceof Date ? booking.checkInDate : new Date(booking.checkInDate);
            const existingCheckOut = booking.checkOutDate instanceof Date ? booking.checkOutDate : new Date(booking.checkOutDate);
            return (checkIn < existingCheckOut && checkOut > existingCheckIn);
        });

        if (hasConflict) {
            throw new Error('Room is not available for the selected dates');
        }

        return await this.repository.create(data);
    }

    async confirmBooking(id) {
        const booking = await this.repository.getById(id);
        if (!booking.isPending()) {
            throw new Error('Only pending bookings can be confirmed');
        }
        return await this.repository.confirm(id);
    }

    async cancelBooking(id) {
        const booking = await this.repository.getById(id);
        if (booking.isCancelled()) {
            throw new Error('Booking is already cancelled');
        }
        if (booking.isCompleted()) {
            throw new Error('Cannot cancel a completed booking');
        }
        return await this.repository.cancel(id);
    }
}

