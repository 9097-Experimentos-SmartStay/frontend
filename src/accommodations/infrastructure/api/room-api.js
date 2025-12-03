import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";

// Swagger Path: /api/v1/rooms
const roomsEndpointPath = import.meta.env.VITE_ROOMS_ENDPOINT_PATH;

/**
 * RoomApi class.
 * Handles API communication for Room Resources.
 * Extends BaseApi to ensure Token injection.
 */
export class RoomApi extends BaseApi {
    #endpoint;

    constructor() {
        super();
        this.#endpoint = new BaseEndpoint(this, roomsEndpointPath);
    }

    /**
     * Retrieves all room resources.
     * @returns {Promise<Object>} Axios response.
     */
    getAll() {
        return this.#endpoint.getAll();
    }

    /**
     * Retrieves a room resource by ID.
     * @param {number} roomId
     * @returns {Promise<Object>} Axios response.
     */
    getById(roomId) {
        return this.#endpoint.getById(roomId);
    }

    /**
     * Creates a new room resource.
     * @param {Object} data
     * @returns {Promise<Object>} Axios response.
     */
    create(data) {
        return this.#endpoint.create(data);
    }

    /**
     * Get rooms by type.
     * Swagger Endpoint: GET /api/v1/rooms/type/{roomTypeId}
     * @param {number} roomTypeId
     * @returns {Promise<Object>} Axios response.
     */
    getByType(roomTypeId) {
        // We use the configured axios instance (this.http) to perform the custom GET request.
        return this.http.get(`${roomsEndpointPath}/type/${roomTypeId}`);
    }
}