// src/bounded-contexts/accommodations/application/room-type-service.js
import { RoomTypeRepository } from '../infrastructure/repositories/room-type-repository.js';

export class RoomTypeService {
    constructor() {
        this.repository = new RoomTypeRepository();
    }

    async getAllRoomTypes() {
        return await this.repository.getAll();
    }

    async getRoomTypeById(id) {
        return await this.repository.getById(id);
    }

    async createRoomType(data) {
        // Validaciones de dominio
        if (!data.name || !data.description) {
            throw new Error('Name and description are required');
        }
        return await this.repository.create(data);
    }
}

