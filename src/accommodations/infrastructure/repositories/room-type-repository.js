// src/bounded-contexts/accommodations/infrastructure/repositories/room-type-repository.js
import { roomTypeApi } from '../api/room-type-api.js';
import { RoomType } from '../../domain/model/room-type.entity.js';

export class RoomTypeRepository {
    async getAll() {
        const resources = await roomTypeApi.getAll();
        return resources.map(resource => RoomType.fromResource(resource));
    }

    async getById(id) {
        const resource = await roomTypeApi.getById(id);
        return RoomType.fromResource(resource);
    }

    async create(data) {
        const resource = await roomTypeApi.create(data);
        return RoomType.fromResource(resource);
    }
}

