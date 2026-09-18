import { Room } from '../domain/model/room.entity.js';

/**
 * Assembler to convert between Room Resources (Infrastructure) and Room Entities (Domain).
 * @class
 */
export class RoomAssembler {

    /**
     * Converts a raw Resource into a Domain Entity.
     * @param {Object} resource - The raw resource object.
     * @param {number} resource.id - The unique identifier.
     * @param {number} resource.hotelId - The hotel ID.
     * @param {number} resource.roomTypeId - The room type ID.
     * @param {string} resource.roomTypeName - The room type name.
     * @param {number} resource.price - The price.
     * @param {string} resource.description - The description.
     * @param {Array<string>} resource.amenities - The list of amenities.
     * @returns {Room | null} Domain Entity
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;

        return new Room({
            id: resource.id,
            hotelId: resource.hotelId,
            roomTypeId: resource.roomTypeId,
            roomTypeName: resource.roomTypeName,
            price: resource.price,
            description: resource.description,
            amenities: resource.amenities
        });
    }

    /**
     * Converts a list of Resources into a list of Entities.
     * @param {Object} response - Axios response object.
     * @param {Array} response.data - The array of resource objects.
     * @returns {Array<Room>} List of Room Entities.
     */
    static toEntitiesFromResponse(response) {
        if (!response.data || !Array.isArray(response.data)) return [];
        return response.data.map(resource => RoomAssembler.toEntityFromResource(resource));
    }

    /**
     * Converts a single Resource response into an Entity.
     * @param {Object} response - Axios response object.
     * @param {Object} response.data - The resource object.
     * @returns {Room | null} Domain Entity.
     */
    static toEntityFromResponse(response) {
        if (!response.data) return null;
        return RoomAssembler.toEntityFromResource(response.data);
    }
}