// src/modules/property/application/PropertyService.js

export class PropertyService {
    constructor(propertyRepository) { this.propertyRepository = propertyRepository; }
    async getRoomList() { return await this.propertyRepository.getRooms(); }
    async getRoomDetails(roomId) { return await this.propertyRepository.getRoomById(roomId); } // NUEVO
    async createRoom(roomData) { // NUEVO
        // Aquí iría validación de negocio antes de guardar
        console.log("Service: Creating room", roomData);
        return await this.propertyRepository.addRoom(roomData);
    }
    async updateRoomDetails(roomId, roomData) { // NUEVO
        // Aquí iría validación de negocio
        console.log(`Service: Updating room ${roomId}`, roomData);
        return await this.propertyRepository.updateRoom(roomId, roomData);
    }
    async removeRoom(roomId) { // NUEVO
        // Lógica de negocio (ej: verificar si hay reservas activas)
        console.log(`Service: Deleting room ${roomId}`);
        await this.propertyRepository.deleteRoom(roomId);
    }
    async getPropertyList() { return await this.propertyRepository.getProperties(); }
    async getTaskList() { return await this.propertyRepository.getTasks(); }

    async markTaskAsCompleted(taskId) {
        try {
            const updatedTask = await this.propertyRepository.updateTask(taskId, { status: 'Completada' }); // Ajusta el estado según tu modelo
            console.log(`✅ Tarea ${taskId} marcada como completada.`);
            return updatedTask;
        } catch (error) {
            console.error(`Error al completar tarea ${taskId}:`, error);
            throw error;
        }
    }

    // Services to support staff app functionality
    async getAssignedRoomsForStaff() {
        const allRooms = await this.propertyRepository.getRooms();
        return allRooms.filter(room => room.status === 'Por limpiar' || room.status === 'Revisión pendiente');
    }
}