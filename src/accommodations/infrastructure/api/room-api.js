import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";
import { endpoints } from "@/shared/infrastructure/config/api-config.js";

// Swagger Path: /api/v1/rooms
const roomsEndpointPath = endpoints.rooms;

/**
 * RoomApi class.
 * Handles API communication for Room Resources.
 * Extends BaseApi to ensure Token injection.
 * @class
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
     * @param {number} roomId - The unique identifier of the room.
     * @returns {Promise<Object>} Axios response.
     */
    getById(roomId) {
        return this.#endpoint.getById(roomId);
    }

    /**
     * Creates a new room resource.
     * @param {Object} data - The room data.
     * @returns {Promise<Object>} Axios response.
     */
    create(data) {
        return this.#endpoint.create(data);
    }

    /**
     * Get rooms by type.
     * Swagger Endpoint: GET /api/v1/rooms/type/{roomTypeId}
     * @param {number} roomTypeId - The room type ID.
     * @returns {Promise<Object>} Axios response.
     */
    getByType(roomTypeId) {
        // We use the configured axios instance (this.http) to perform the custom GET request.
        return this.http.get(`${roomsEndpointPath}/type/${roomTypeId}`);
    }

    /**
     * Updates an existing room resource.
     * PUT /api/v1/rooms/{id}
     * @param {number} id - The room ID.
     * @param {Object} resource - The updated room data (UpdateRoomResource).
     * @returns {Promise<Object>} Axios response.
     */
    update(id, resource) {
        return this.#endpoint.update(id, resource);
    }

    /**
     * Deletes a room resource.
     * DELETE /api/v1/rooms/{id}
     * @param {number} id - The room ID.
     * @returns {Promise<Object>} Axios response.
     */
    delete(id) {
        return this.#endpoint.delete(id);
    }
}