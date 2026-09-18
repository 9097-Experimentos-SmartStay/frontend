import { BaseApi } from '@/shared/infrastructure/services/base-api.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';

const bookingsPath = endpoints.bookings;
const roomsPath = endpoints.rooms;

/**
 * Bookings (§8). GET /bookings is scoped by the backend: a guest gets their own bookings; reception,
 * housekeeping, maintenance and admin those of their hotel; a chain_admin every booking.
 */
export class BookingApi extends BaseApi {
    /** GET /bookings → BookingResource[] (newest first). */
    getAll() {
        return this.http.get(bookingsPath);
    }

    /**
     * GET /bookings/{id} → 404 when missing, another guest's or another hotel's.
     * @param {number} id
     */
    getById(id) {
        return this.http.get(`${bookingsPath}/${id}`);
    }

    /**
     * POST /bookings → 201 BookingResource (Pending) | 400 per field | 403 other hotel | 409 unavailable.
     * @param {Object} resource - Built by BookingAssembler.toCreateResource.
     */
    create(resource) {
        return this.http.post(bookingsPath, resource);
    }

    /**
     * PATCH /bookings/{id} {checkInDate?, checkOutDate?, roomId?} → 200 BookingResource | 409 unavailable / paid total.
     * @param {number} id
     * @param {Object} resource - Built by BookingAssembler.toChangeResource.
     */
    change(id, resource) {
        return this.http.patch(`${bookingsPath}/${id}`, resource);
    }

    /**
     * POST /bookings/{id}/cancel → 200 BookingResource (Cancelled) | 409 not cancellable (status, check-in day).
     * @param {number} id
     */
    cancel(id) {
        return this.http.post(`${bookingsPath}/${id}/cancel`);
    }

    /**
     * GET /bookings/calendar?from&to&hotelId (to excluded, ≤ 92 days) → BookingCalendarResource.
     * @param {{from: string, to: string, hotelId?: number}} params
     */
    getCalendar(params) {
        return this.http.get(`${bookingsPath}/calendar`, { params });
    }

    /**
     * GET /rooms/available?checkIn&checkOut&hotelId → AvailableRoomResource[] free for the whole stay (any role).
     * @param {{checkIn: string, checkOut: string, hotelId?: number}} params
     */
    getAvailableRooms(params) {
        return this.http.get(`${roomsPath}/available`, { params });
    }
}
