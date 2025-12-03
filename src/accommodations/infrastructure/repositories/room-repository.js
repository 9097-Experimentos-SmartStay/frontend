import { RoomApi } from '../api/room-api.js';
import { Room } from '../../domain/model/room.entity.js';

/**
 * Repository implementation for Room entities.
 * Maps API Resources to Domain Entities.
 */
export class RoomRepository {
    constructor() {
        // Dependency Injection of the API Client
        this.api = new RoomApi();
    }

    /**
     * Retrieves all rooms.
     * @returns {Promise<Array<Room>>}
     */
    async getAll() {
        const response = await this.api.getAll();
        const resources = response.data; // Extracting resources from Axios response
        return resources.map(resource => Room.fromResource(resource));
    }

    /**
     * Retrieves a room by ID.
     * @param {number} id
     * @returns {Promise<Room>}
     */
    async getById(id) {
        const response = await this.api.getById(id);
        const resource = response.data;
        return Room.fromResource(resource);
    }

    /**
     * Retrieves rooms filtered by Room Type ID.
     * @param {number} roomTypeId
     * @returns {Promise<Array<Room>>}
     */
    async getByType(roomTypeId) {
        const response = await this.api.getByType(roomTypeId);
        const resources = response.data;
        return resources.map(resource => Room.fromResource(resource));
    }

    /**
     * Creates a new room.
     * @param {Object} data
     * @returns {Promise<Room>}
     */
    async create(data) {
        const response = await this.api.create(data);
        const resource = response.data;
        return Room.fromResource(resource);
    }
}