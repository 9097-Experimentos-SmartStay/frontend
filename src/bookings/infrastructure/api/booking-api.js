import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";

// Swagger Path: /api/v1/bookings
// noinspection DuplicatedCode
const bookingsEndpointPath = import.meta.env.VITE_BOOKINGS_ENDPOINT_PATH;

/**
 * BookingApi class.
 * Direct communication with the Backend for Booking resources.
 * @class
 */
export class BookingApi extends BaseApi {
    #endpoint;

    constructor() {
        super();
        this.#endpoint = new BaseEndpoint(this, bookingsEndpointPath);
    }

    /**
     * Get all bookings.
     * @returns {Promise<Object>} Axios response.
     */
    getAllBookings() {
        return this.#endpoint.getAll();
    }

    /**
     * Get booking by ID.
     * @param {number} id - The unique identifier of the booking.
     * @returns {Promise<Object>} Axios response.
     */
    getBookingById(id) {
        return this.#endpoint.getById(id);
    }

    /**
     * Create a new booking.
     * @param {Object} resource - The booking data resource.
     * @returns {Promise<Object>} Axios response.
     */
    createBooking(resource) {
        return this.#endpoint.create(resource);
    }

    // --- MÉTODOS CUSTOM (No están en BaseEndpoint) ---

    /**
     * Get bookings by room ID.
     * Swagger: GET /api/v1/bookings/room/{roomId}
     * @param {number} roomId - The room identifier.
     * @returns {Promise<Object>} Axios response.
     */
    getBookingsByRoomId(roomId) {
        // Usamos this.http para peticiones personalizadas
        return this.http.get(`${bookingsEndpointPath}/room/${roomId}`);
    }

    /**
     * Confirm a booking.
     * Swagger: POST /api/v1/bookings/{bookingId}/confirm
     * @param {number} id - The booking identifier.
     * @returns {Promise<Object>} Axios response.
     */
    confirmBooking(id) {
        return this.http.post(`${bookingsEndpointPath}/${id}/confirm`);
    }

    /**
     * Cancel a booking.
     * Swagger: POST /api/v1/bookings/{bookingId}/cancel
     * @param {number} id - The booking identifier.
     * @returns {Promise<Object>} Axios response.
     */
    cancelBooking(id) {
        return this.http.post(`${bookingsEndpointPath}/${id}/cancel`);
    }
}