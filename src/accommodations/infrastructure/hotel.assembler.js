import { Hotel } from '../domain/model/hotel.entity.js';

/**
 * Assembler to convert data between Infrastructure (API Resource) and Domain (Entity).
 */
export class HotelAssembler {
    /**
     * Converts a raw resource object from the API into a Hotel Entity.
     * @param {Object} resource - The raw data from the API response.
     * @returns {Hotel} The domain entity.
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new Hotel({
            id: resource.id,
            name: resource.name,
            description: resource.description,
            address: resource.address,
            city: resource.city,
            country: resource.country,
            rating: resource.rating,
            photoUrl: resource.photoUrl
        });
    }

    /**
     * Converts a list of resources into a list of Hotel Entities.
     * @param {Object} response - The Axios response object.
     * @returns {Array<Hotel>} List of Hotel entities.
     */
    static toEntitiesFromResponse(response) {
        if (!response.data || !Array.isArray(response.data)) return [];
        return response.data.map(resource => HotelAssembler.toEntityFromResource(resource));
    }

    /**
     * Converts a single resource response into a Hotel Entity.
     * @param {Object} response - The Axios response object.
     * @returns {Hotel} The domain entity.
     */
    static toEntityFromResponse(response) {
        if (!response.data) return null;
        return HotelAssembler.toEntityFromResource(response.data);
    }
}