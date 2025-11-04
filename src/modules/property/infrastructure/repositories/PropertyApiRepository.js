// src/modules/property/infrastructure/repositories/IPropertyRepository.js

import { IPropertyRepository } from "../../domain/repositories/IPropertyRepository.js";
import { propertyApi } from "../api/PropertyApi.js";

export class PropertyApiRepository extends IPropertyRepository {
    async getRooms(propertyId = null) { return await propertyApi.fetchRooms(propertyId); }
    async getRoomById(roomId) { return await propertyApi.fetchRoomById(roomId); }
    async addRoom(roomData) { return await propertyApi.postRoom(roomData); }
    async updateRoom(roomId, roomData) { return await propertyApi.patchRoom(roomId, roomData); }
    async deleteRoom(roomId) { await propertyApi.removeRoom(roomId); }
    async getProperties() { return await propertyApi.fetchProperties(); }
    async getAllProperties() {return await propertyApi.fetchProperties();}
    async getPropertyById(propertyId) {return await propertyApi.fetchPropertyById(propertyId);}
    async createProperty(propertyData) {return await propertyApi.postProperty(propertyData);}
    async updateProperty(propertyId, propertyData) {return await propertyApi.patchProperty(propertyId, propertyData);}
    async deleteProperty(propertyId) {return await propertyApi.removeProperty(propertyId);}
    async getTasks(assignedTo = null) { return await propertyApi.fetchTasks(assignedTo); }
    async updateTask(taskId, data) { return await propertyApi.patchTask(taskId, data); }
    async addTask(taskData) { return await propertyApi.postTask(taskData); }
    async deleteTask(taskId) { await propertyApi.removeTask(taskId); }
}