// src/modules/staff/application/staff_service.js
import { staffRepository } from "../domain/staff_repository.js";

export const staffService = {
    getAllTasks() {
        return staffRepository.getTasks();
    },

    getAssignedRooms() {
        return staffRepository.getAssignedRooms();
    },

    markTaskCompleted(taskId) {
        console.log(`✅ Tarea ${taskId} marcada como completada.`);
    }
};
