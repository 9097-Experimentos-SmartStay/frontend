import { RoomType } from '../domain/model/room-type.entity.js';

/**
 * Assembler to convert between RoomType Resources (Infrastructure) and RoomType Entities (Domain).
 * @class
 */
export class RoomTypeAssembler {
    /**
     * Converts a raw resource into a RoomType Entity.
     * @param {Object} resource - The raw resource object.
     * @param {number} resource.id - The unique identifier.
     * @param {string} resource.name - The name of the room type.
     * @param {string} resource.description - The description.
     * @returns {RoomType | null} The domain entity.
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new RoomType({
            id: resource.id,
            name: resource.name,
            description: resource.description
        });
    }

    /**
     * Converts a list of resources into a list of RoomType Entities.
     * @param {Object} response - The Axios response object.
     * @param {Array} response.data - The array of resource objects.
     * @returns {Array<RoomType>} List of RoomType entities.
     */
    static toEntitiesFromResponse(response) {
        if (!response.data || !Array.isArray(response.data)) return [];
        return response.data.map(resource => RoomTypeAssembler.toEntityFromResource(resource));
    }

    /**
     * Converts a single resource response into a RoomType Entity.
     * @param {Object} response - The Axios response object.
     * @param {Object} response.data - The resource object.
     * @returns {RoomType | null} The domain entity.
     */
    static toEntityFromResponse(response) {
        if (!response.data) return null;
        return RoomTypeAssembler.toEntityFromResource(response.data);
    }
}