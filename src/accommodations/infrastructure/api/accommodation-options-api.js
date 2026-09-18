import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { endpoints } from "@/shared/infrastructure/config/api-config.js";

// TODO(phase-2b): confirm these option routes and their payloads against the backend contract.
const optionsEndpointPath = endpoints.accommodationOptions;

/**
 * AccommodationOptionsApi class.
 * Master data shared by hotels and rooms: hotel categories and amenities.
 * @class
 */
export class AccommodationOptionsApi extends BaseApi {
    /**
     * GET /accommodations/options/categories
     * @returns {Promise<Object>} Axios response (array of category names).
     */
    getCategories() {
        return this.http.get(`${optionsEndpointPath}/categories`);
    }

    /**
     * POST /accommodations/options/categories
     * @param {{name: string}} data
     * @returns {Promise<Object>} Axios response.
     */
    createCategory(data) {
        return this.http.post(`${optionsEndpointPath}/categories`, data);
    }

    /**
     * GET /accommodations/options/amenities
     * @returns {Promise<Object>} Axios response (array of amenity names).
     */
    getAmenities() {
        return this.http.get(`${optionsEndpointPath}/amenities`);
    }

    /**
     * POST /accommodations/options/amenities
     * @param {{name: string}} data
     * @returns {Promise<Object>} Axios response.
     */
    createAmenity(data) {
        return this.http.post(`${optionsEndpointPath}/amenities`, data);
    }
}
