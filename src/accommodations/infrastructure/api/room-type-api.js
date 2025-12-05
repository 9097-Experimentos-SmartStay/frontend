import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";

// Swagger Path: /api/v1/room-types
const roomTypesEndpointPath = import.meta.env.VITE_ROOM_TYPES_ENDPOINT_PATH;

/**
 * RoomTypeApi class.
 * Handles API communication for RoomType Resources.
 * Extends BaseApi to ensure Token injection and centralized configuration.
 * @class
 */
export class RoomTypeApi extends BaseApi {
    #endpoint;

    constructor() {
        super();
        // BaseEndpoint provides standard CRUD: getAll, getById, create, update, delete
        this.#endpoint = new BaseEndpoint(this, roomTypesEndpointPath);
    }

    /**
     * Retrieves all room type resources.
     * @returns {Promise<Object>} The axios response containing the list of resources.
     */
    getAll() {
        return this.#endpoint.getAll();
    }

    /**
     * Retrieves a specific room type resource by ID.
     * @param {number} id - The room type ID.
     * @returns {Promise<Object>} The axios response containing the resource.
     */
    getById(id) {
        return this.#endpoint.getById(id);
    }

    /**
     * Creates a new room type resource.
     * @param {Object} resource - The room type data (CreateRoomTypeResource).
     * @returns {Promise<Object>} The axios response containing the created resource.
     */
    create(resource) {
        return this.#endpoint.create(resource);
    }
}