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
        const randomRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
        return new Hotel({
            id: resource.id,
            name: resource.name,
            description: resource.description,
            location: resource.location,
            rating: randomRating,
            photoUrl: resource.imageUrl,
            basePrice: resource.basePrice,
            amenities: resource.amenities
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