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
    async getTaskList(assignedTo = null) {
        return await this.propertyRepository.getTasks(assignedTo);
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

    async getTaskStats(staffId) {
        if (!staffId) return { daily: 0, weekly: 0, monthly: 0, yearly: 0 };

        const tasks = await this.propertyRepository.getTasks(staffId);
        const completedTasks = tasks.filter(t => t.status === 'Completada' && t.completedAt);

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Inicio del Domingo
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        let stats = {
            daily: 0,
            weekly: 0,
            monthly: 0,
            yearly: 0,
            // Datos para el gráfico de los últimos 7 días
            chartData: {
                labels: [], // ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today']
                datasets: [{
                    label: 'Tasks Completed',
                    data: [], // [5, 3, 4, 2, 6, 7, 1]
                    backgroundColor: '#1ABC9C', // Verde agua de tu diseño
                    borderColor: '#1ABC9C',
                }]
            }
        };

        const dailyCounts = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            const label = i === 0 ? 'Today' : `D-${i}`;
            stats.chartData.labels.push(label);
            dailyCounts.set(dateString, 0); // Inicializa contador para los últimos 7 días
        }

        for (const task of completedTasks) {
            const completedDate = new Date(task.completedAt);
            const completedDateString = task.completedAt.split('T')[0];

            if (completedDateString === today) stats.daily++;
            if (completedDate >= startOfWeek) stats.weekly++;
            if (completedDate >= startOfMonth) stats.monthly++;
            if (completedDate >= startOfYear) stats.yearly++;

            // Contar para el gráfico
            if (dailyCounts.has(completedDateString)) {
                dailyCounts.set(completedDateString, dailyCounts.get(completedDateString) + 1);
            }
        }

        // Poblar datos del gráfico
        for (const count of dailyCounts.values()) {
            stats.chartData.datasets[0].data.push(count);
        }

        console.log("PropertyService: Calculated Stats:", stats);
        return stats;
    }

    // Services to support staff app functionality
    async getAssignedRoomsForStaff() {
        const allRooms = await this.propertyRepository.getRooms();
        return allRooms.filter(room => room.status === 'Por limpiar' || room.status === 'Revisión pendiente');
    }
}