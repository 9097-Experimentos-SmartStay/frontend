// src/modules/property/infrastructure/repositories/IPropertyRepository.js

import { IPropertyRepository } from "../../domain/repositories/IPropertyRepository.js";
import { propertyApi } from "../api/PropertyApi.js";

export class PropertyApiRepository extends IPropertyRepository {
    async getRooms() { return await propertyApi.fetchRooms(); }
    async getRoomById(roomId) { return await propertyApi.fetchRoomById(roomId); } // NUEVO
    async addRoom(roomData) { return await propertyApi.postRoom(roomData); }       // NUEVO
    async updateRoom(roomId, roomData) { return await propertyApi.patchRoom(roomId, roomData); } // NUEVO
    async deleteRoom(roomId) { await propertyApi.removeRoom(roomId); }   // NUEVO
    async getProperties() { return await propertyApi.fetchProperties(); }
    async getTasks(assignedTo = null) { return await propertyApi.fetchTasks(assignedTo); }
    async updateTask(taskId, data) { return await propertyApi.patchTask(taskId, data); }
}