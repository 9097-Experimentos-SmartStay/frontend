import { Hotel } from '../domain/model/hotel.entity.js';

/**
 * Assembler to convert data between Infrastructure (API Resource) and Domain (Entity).
 * @class
 */
export class HotelAssembler {
    /**
     * Converts a raw resource object from the API into a Hotel Entity.
     * @param {Object} resource - The raw data from the API response.
     * @param {number} resource.id - The unique identifier.
     * @param {string} resource.name - The name of the hotel.
     * @param {string} resource.description - The description.
     * @param {string} resource.location - The location.
     * @param {string} resource.imageUrl - The URL of the image.
     * @param {number} resource.basePrice - The base price.
     * @param {Array<string>} resource.amenities - The list of amenities.
     * @returns {Hotel} The domain entity.
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new Hotel({
            id: resource.id,
            name: resource.name,
            description: resource.description,
            location: resource.location,
            // No fabricated ratings: null until the backend provides one (reviews are out of scope).
            rating: resource.rating ?? null,
            photoUrl: resource.imageUrl,
            basePrice: resource.basePrice,
            amenities: resource.amenities
        });
    }

    /**
     * Converts a list of resources into a list of Hotel Entities.
     * @param {Object} response - The Axios response object.
     * @param {Array} response.data - The array of resource objects.
     * @returns {Array<Hotel>} List of Hotel entities.
     */
    static toEntitiesFromResponse(response) {
        if (!response.data || !Array.isArray(response.data)) return [];
        return response.data.map(resource => HotelAssembler.toEntityFromResource(resource));
    }

    /**
     * Converts a single resource response into a Hotel Entity.
     * @param {Object} response - The Axios response object.
     * @param {Object} response.data - The resource object.
     * @returns {Hotel} The domain entity.
     */
    static toEntityFromResponse(response) {
        if (!response.data) return null;
        return HotelAssembler.toEntityFromResource(response.data);
    }
}