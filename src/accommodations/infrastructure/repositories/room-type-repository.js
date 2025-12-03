import { RoomTypeApi } from '../api/room-type-api.js';
import { RoomType } from '../../domain/model/room-type.entity.js';

/**
 * Repository implementation for RoomType entities.
 * Acts as an adapter between the Domain Layer and the Infrastructure Layer (API).
 */
export class RoomTypeRepository {
    constructor() {
        // Dependency Injection of the API Client
        this.api = new RoomTypeApi();
    }

    /**
     * Retrieves all room types and maps them to Domain Entities.
     * @returns {Promise<Array<RoomType>>} List of RoomType entities.
     */
    async getAll() {
        const response = await this.api.getAll();
        // Axios wraps the body in a 'data' property.
        const resources = response.data;
        return resources.map(resource => RoomType.fromResource(resource));
    }

    /**
     * Retrieves a room type by ID and maps it to a Domain Entity.
     * @param {number} id
     * @returns {Promise<RoomType>} RoomType entity.
     */
    async getById(id) {
        const response = await this.api.getById(id);
        const resource = response.data;
        return RoomType.fromResource(resource);
    }

    /**
     * Creates a new room type.
     * @param {Object} data - Data to create the resource.
     * @returns {Promise<RoomType>} The created RoomType entity.
     */
    async create(data) {
        const response = await this.api.create(data);
        const resource = response.data;
        return RoomType.fromResource(resource);
    }
}