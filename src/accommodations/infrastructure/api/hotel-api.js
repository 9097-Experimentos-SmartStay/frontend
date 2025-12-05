import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";

const hotelsEndpointPath = import.meta.env.VITE_HOTELS_ENDPOINT_PATH;

/**
 * HotelApi class.
 * Direct communication with the Backend for Hotel resources.
 * @class
 */
export class HotelApi extends BaseApi {
    #endpoint;

    constructor() {
        super();
        this.#endpoint = new BaseEndpoint(this, hotelsEndpointPath);
    }

    /**
     * Get all hotels.
     * @returns {Promise<Object>} Axios response.
     */
    getAll() {
        return this.#endpoint.getAll();
    }

    /**
     * Get hotel by ID.
     * @param {number} id - The unique identifier of the hotel.
     * @returns {Promise<Object>} Axios response.
     */
    getById(id) {
        return this.#endpoint.getById(id);
    }

    /**
     * Create a new hotel.
     * @param {Object} resource - The hotel data resource.
     * @returns {Promise<Object>} Axios response.
     */
    create(resource) {
        return this.#endpoint.create(resource);
    }

    /**
     * Gets the available hotel categories.
     * GET /api/v1/accommodations/options/categories
     * @returns {Promise<Object>} Axios response.
     */
    getHotelCategories() {
        // Ajusta la ruta según definimos el controller
        return this.http.get('/accommodations/options/categories');
    }

    /**
     * Updates an existing hotel resource.
     * PUT /api/v1/hotels/{id}
     * @param {number} id - The hotel ID.
     * @param {Object} resource - The updated hotel data.
     * @returns {Promise<Object>} Axios response.
     */
    update(id, resource) {
        return this.#endpoint.update(id, resource);
    }

    /**
     * Deletes a hotel resource.
     * DELETE /api/v1/hotels/{id}
     * @param {number} id - The hotel ID.
     * @returns {Promise<Object>} Axios response.
     */
    delete(id) {
        return this.#endpoint.delete(id);
    }

    /**
     * Gets the available amenities.
     * GET /api/v1/accommodations/options/amenities
     * @returns {Promise<Object>} Axios response.
     */
    getAmenities() {
        return this.http.get('/accommodations/options/amenities');
    }

    /**
     * Creates a new category.
     * POST /api/v1/accommodations/options/categories
     * @param {Object} data - The category data.
     * @returns {Promise<Object>} Axios response.
     */
    createCategory(data) {
        return this.http.post('/accommodations/options/categories', data);
    }

    /**
     * Creates a new amenity option.
     * POST /api/v1/accommodations/options/amenities
     * @param {Object} data - { name: string }
     * @param {string} data.name - The name of the amenity.
     * @returns {Promise<Object>} Axios response.
     */
    createAmenity(data) {
        return this.http.post('/accommodations/options/amenities', data);
    }

}