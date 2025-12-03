// src/bounded-contexts/accommodations/application/room-service.js
import { RoomRepository } from '../infrastructure/repositories/room-repository.js';
import { RoomTypeService } from './room-type-service.js';

export class RoomService {
    constructor() {
        this.repository = new RoomRepository();
        this.roomTypeService = new RoomTypeService();
    }

    async getAllRooms() {
        return await this.repository.getAll();
    }

    async getRoomById(id) {
        return await this.repository.getById(id);
    }

    async getRoomsByType(roomTypeId) {
        // Validar que el roomType existe
        await this.roomTypeService.getRoomTypeById(roomTypeId);
        return await this.repository.getByType(roomTypeId);
    }

    async createRoom(data) {
        // Validaciones de dominio
        if (!data.roomTypeId) {
            throw new Error('roomTypeId is required');
        }
        if (!data.description) {
            throw new Error('description is required');
        }
        if (!Array.isArray(data.amenities)) {
            throw new Error('amenities must be an array');
        }

        // Validar que el roomType existe
        await this.roomTypeService.getRoomTypeById(data.roomTypeId);

        return await this.repository.create(data);
    }
}

