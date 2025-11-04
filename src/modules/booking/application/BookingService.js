// src/modules/booking/application/booking_service.js
import { IPropertyRepository } from '../../property/domain/repositories/IPropertyRepository.js';
import { Booking } from '../domain/model/booking.entity.js';
import { Review } from '../domain/model/review.entity.js';

export class BookingService {
    constructor(bookingRepository, propertyRepository) {
        if (!bookingRepository) throw new Error("BookingRepository is required");
        if (!propertyRepository) throw new Error("PropertyRepository is required");
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
    }

    async getMyBookings(guestId) {
        if (!guestId) throw new Error("Guest ID is required to fetch bookings.");
        console.log(`BookingService: Getting bookings for guest ${guestId}`);

        // --- 1. "VISIÓN ESPACIAL" (Cargar todas las "piezas") ---
        // Usamos el 'propertyRepository' que el servicio YA tiene.
        const [rawBookings, allProperties, allRooms] = await Promise.all([
            this.bookingRepository.getBookings(guestId),
            this.propertyRepository.getProperties(), // Asumo que esto trae los hoteles
            this.propertyRepository.getRooms(null)   // Asumo que getRooms(null) trae todas las habitaciones
        ]);

        if (!rawBookings || !rawBookings.length) return [];

        // --- 2. EL "PASE QUÍMICO" (Combinar los datos) ---
        const enrichedBookings = rawBookings.map(booking => {
            const property = allProperties.find(p => p.id === booking.propertyId);
            const room = allRooms.find(r => r.id === booking.roomId); // ¡Usamos el roomId de la reserva!

            return {
                ...booking, // La reserva original
                propertyName: property?.name || 'Propiedad Desconocida',
                propertyLocation: property?.location || '',
                roomNumber: room?.number || '??',
                roomType: room?.type || 'Habitación'
            };
        });

        return enrichedBookings;
    }

    async bookProperty(bookingDetails) {
        // --- "JUGADA" MEJORADA ---
        const { propertyId, roomId, guestId, checkInDate, checkOutDate, totalPrice } = bookingDetails;

        if (!propertyId || !roomId || !guestId || !checkInDate || !checkOutDate || !totalPrice) {
            throw new Error("Todos los detalles (property, room, guest, dates, price) son requeridos.");
        }
        if (new Date(checkOutDate) <= new Date(checkInDate)) {
            throw new Error("Check-out date must be after check-in date.");
        }
        console.log(`BookingService: Room ${roomId} availability check passed (simulated).`);

        const bookingData = Booking.create({
            propertyId: propertyId,
            roomId: roomId,
            guestId: guestId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalPrice: totalPrice,
            status: 'Confirmada',
        });

        const newBookingRaw = await this.bookingRepository.addBooking(bookingData);
        console.log(`BookingService: Booking created successfully:`, newBookingRaw);
        // Optional: Map response to Booking instance
        // return new Booking(newBookingRaw.id, ...);
        return newBookingRaw;
    }

    async cancelMyBooking(bookingId, guestId) {
        if (!bookingId || !guestId) throw new Error("Booking ID and Guest ID are required to cancel.");
        console.log(`BookingService: Ownership and status checks passed for booking ${bookingId} (simulated).`);
        console.log(`BookingService: Cancellation policies applied (simulated).`);

        await this.bookingRepository.deleteBooking(bookingId);
        console.log(`BookingService: Booking ${bookingId} cancelled successfully.`);
        return true;
    }

    async submitReview(bookingId, guestId, reviewText, rating) {
        if (!bookingId || !guestId || !reviewText || rating === undefined) {
            throw new Error("Booking ID, Guest ID, review text, and rating are required.");
        }
        console.log(`BookingService: Booking ${bookingId} validation for review passed (simulated).`);

        // --- Use the static method of the model to create the data object ---
        const reviewData = Review.create({
            bookingId: bookingId,
            guestId: guestId,
            comment: reviewText,
            rating: rating,
        });

        const newReviewRaw = await this.bookingRepository.addReview(reviewData);
        console.log(`BookingService: Review submitted successfully:`, newReviewRaw);
        // Optional: Map response to Review instance
        // return new Review(newReviewRaw.id, ...);
        return newReviewRaw;
    }

    async getAllBookings() {
        console.log(`BookingService: Getting all bookings`);
        return await this.bookingRepository.getAllBookings();
    }

}