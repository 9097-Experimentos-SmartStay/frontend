// src/modules/property/application/PropertyService.js

export class PropertyService {
    constructor(propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    async getRoomList() {
        return await this.propertyRepository.getRooms();
    }

    async getPropertyList() {
        return await this.propertyRepository.getProperties();
    }

    async getTaskList() {
        return await this.propertyRepository.getTasks();
    }

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