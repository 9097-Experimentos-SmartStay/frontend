// src/modules/property/infrastructure/repository/room-repository.js
import { Room } from '../../domain/model/room.entity.js';
import { roomApi } from '../api/room-api.js';

export class RoomRepository {
    async getAll() {
        const data = await roomApi.fetchAll();
        return data.map(room => new Room(room));
    }

    async getById(id) {
        const data = await roomApi.fetchById(id);
        return new Room(data);
    }

    async add(roomData) {
        const created = await roomApi.postRoom(roomData);
        return new Room(created);
    }

    async update(id, roomData) {
        const updated = await roomApi.patchRoom(id, roomData);
        return new Room(updated);
    }

    async delete(id) {
        await roomApi.removeRoom(id);
    }
}
