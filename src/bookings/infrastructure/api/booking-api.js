import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";

// Swagger Path: /api/v1/bookings
// noinspection DuplicatedCode
const bookingsEndpointPath = import.meta.env.VITE_BOOKINGS_ENDPOINT_PATH;

export class BookingApi extends BaseApi {
    #endpoint;

    constructor() {
        super();
        this.#endpoint = new BaseEndpoint(this, bookingsEndpointPath);
    }

    getAllBookings() {
        return this.#endpoint.getAll();
    }

    getBookingById(id) {
        return this.#endpoint.getById(id);
    }

    createBooking(resource) {
        return this.#endpoint.create(resource);
    }

    // --- MÉTODOS CUSTOM (No están en BaseEndpoint) ---

    /**
     * Swagger: GET /api/v1/bookings/room/{roomId}
     */
    getBookingsByRoomId(roomId) {
        // Usamos this.http para peticiones personalizadas
        return this.http.get(`${bookingsEndpointPath}/room/${roomId}`);
    }

    /**
     * Swagger: POST /api/v1/bookings/{bookingId}/confirm
     */
    confirmBooking(id) {
        return this.http.post(`${bookingsEndpointPath}/${id}/confirm`);
    }

    /**
     * Swagger: POST /api/v1/bookings/{bookingId}/cancel
     */
    cancelBooking(id) {
        return this.http.post(`${bookingsEndpointPath}/${id}/cancel`);
    }
}