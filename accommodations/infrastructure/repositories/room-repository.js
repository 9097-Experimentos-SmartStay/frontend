// src/bounded-contexts/accommodations/infrastructure/repositories/room-repository.js
import { roomApi } from '../api/room-api.js';
import { Room } from '../../domain/model/room.entity.js';

export class RoomRepository {
    async getAll() {
        const resources = await roomApi.getAll();
        return resources.map(resource => Room.fromResource(resource));
    }

    async getById(id) {
        const resource = await roomApi.getById(id);
        return Room.fromResource(resource);
    }

    async getByType(roomTypeId) {
        const resources = await roomApi.getByType(roomTypeId);
        return resources.map(resource => Room.fromResource(resource));
    }

    async create(data) {
        const resource = await roomApi.create(data);
        return Room.fromResource(resource);
    }
}

