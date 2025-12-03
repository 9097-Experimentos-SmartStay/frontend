import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";

const hotelsEndpointPath = import.meta.env.VITE_HOTELS_ENDPOINT_PATH;

/**
 * HotelApi class.
 * Direct communication with the Backend for Hotel resources.
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
     * @param {number} id
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
}