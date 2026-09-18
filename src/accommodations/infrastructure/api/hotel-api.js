import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";
import { endpoints } from "@/shared/infrastructure/config/api-config.js";

const hotelsEndpointPath = endpoints.hotels;

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
     * Payment methods of a hotel (admin or reception of the hotel, chain_admin).
     * GET /api/v1/hotels/{id}/payment-settings
     * @param {number} id - The hotel ID.
     * @returns {Promise<Object>} Axios response.
     */
    getPaymentSettings(id) {
        return this.http.get(`${hotelsEndpointPath}/${id}/payment-settings`);
    }

    /**
     * Replaces the payment methods of a hotel (admin of the hotel, chain_admin).
     * PUT /api/v1/hotels/{id}/payment-settings
     * @param {number} id - The hotel ID.
     * @param {Object} resource - See HotelPaymentSettingsAssembler.toUpdateResource.
     * @returns {Promise<Object>} Axios response.
     */
    updatePaymentSettings(id, resource) {
        return this.http.put(`${hotelsEndpointPath}/${id}/payment-settings`, resource);
    }
}
