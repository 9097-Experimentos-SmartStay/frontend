import { Booking } from '../domain/model/booking.entity.js';

/**
 * Assembler to convert between Booking Resources and Booking Entities.
 * @class
 */
export class BookingAssembler {

    /**
     * Converts a raw Resource (JSON) into a Domain Entity.
     * @param {import('./resources/booking.resource.js').BookingResource} resource
     * @returns {Booking} Domain Entity
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;

        return new Booking({
            id: resource.id,
            roomId: resource.roomId,
            guestName: resource.guestName,
            guestEmail: resource.guestEmail,
            // AQUÍ ocurre la transformación de tipos (String -> Date)
            checkInDate: resource.checkInDate ? new Date(resource.checkInDate) : null,
            checkOutDate: resource.checkOutDate ? new Date(resource.checkOutDate) : null,
            status: resource.status
        });
    }

    /**
     * Converts a list of Resources into a list of Entities.
     * @param {Object} response - Axios response object
     * @returns {Array<Booking>} List of Booking Entities
     */
    static toEntitiesFromResponse(response) {
        if (!response.data || !Array.isArray(response.data)) return [];
        return response.data.map(resource => BookingAssembler.toEntityFromResource(resource));
    }

    /**
     * Converts a single Resource response into an Entity.
     * @param {Object} response - Axios response object
     * @returns {Booking} Domain Entity
     */
    static toEntityFromResponse(response) {
        if (!response.data) return null;
        return BookingAssembler.toEntityFromResource(response.data);
    }
}