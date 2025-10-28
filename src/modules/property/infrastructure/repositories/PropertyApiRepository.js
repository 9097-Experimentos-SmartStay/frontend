// src/modules/property/infrastructure/repositories/IPropertyRepository.js

import { IPropertyRepository } from "../../domain/repositories/IPropertyRepository.js";
import { propertyApi } from "../api/PropertyApi.js";

export class PropertyApiRepository extends IPropertyRepository {
    async getRooms() {
        // Aquí podrías añadir lógica de mapeo si la API devuelve datos diferentes al dominio
        return await propertyApi.fetchRooms();
    }
    async getProperties() {
        return await propertyApi.fetchProperties();
    }
    async getTasks() {
        return await propertyApi.fetchTasks();
    }
    async updateTask(taskId, data) {
        return await propertyApi.patchTask(taskId, data);
    }
}