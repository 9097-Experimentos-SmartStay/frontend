export class PropertyService {
    constructor(propertyRepository) { this.propertyRepository = propertyRepository; }

    // --- Métodos de Room ---
    async getRoomList() { return await this.propertyRepository.getRooms(); }
    async getRoomDetails(roomId) { return await this.propertyRepository.getRoomById(roomId); }
    async createRoom(roomData) {
        console.log("Service: Creating room", roomData);
        return await this.propertyRepository.addRoom(roomData);
    }
    async updateRoomDetails(roomId, roomData) {
        console.log(`Service: Updating room ${roomId}`, roomData);
        return await this.propertyRepository.updateRoom(roomId, roomData);
    }
    async removeRoom(roomId) {
        console.log(`Service: Deleting room ${roomId}`);
        await this.propertyRepository.deleteRoom(roomId);
    }

    // --- Métodos de Property ---
    async getPropertyList() { return await this.propertyRepository.getProperties(); }

    // --- Métodos de Task ---
    async getTaskList(assignedTo = null) {
        return await this.propertyRepository.getTasks(assignedTo);
    }

    async createTask(taskData) {
        if (!taskData.description) throw new Error("Description is required.");
        const defaults = {
            status: 'Pendiente',
            createdAt: new Date().toISOString()
        };
        const newTask = { ...defaults, ...taskData };
        return await this.propertyRepository.addTask(newTask);
    }

    async updateTaskDetails(taskId, taskData) {
        // No actualiza el estado si solo completa
        const { status, ...dataToUpdate } = taskData;
        console.log(`Service: Updating task ${taskId}`, dataToUpdate);
        return await this.propertyRepository.updateTask(taskId, dataToUpdate);
    }

    async removeTask(taskId) {
        console.log(`Service: Deleting task ${taskId}`);
        await this.propertyRepository.deleteTask(taskId);
    }

    async markTaskAsCompleted(taskId) {
        try {
            const updatedTask = await this.propertyRepository.updateTask(taskId, {
                status: 'Completada',
                completedAt: new Date().toISOString() // Importante para las stats
            });
            console.log(`✅ Tarea ${taskId} marcada como completada.`);
            return updatedTask;
        } catch (error) {
            console.error(`Error al completar tarea ${taskId}:`, error);
            throw error;
        }
    }
    /**
     * Marks a task as 'Pending' and removes its completion date.
     * @param {number|string} taskId - The ID of the task to revert.
     * @returns {Promise<object>} The updated task object.
     */
    async markTaskAsPending(taskId) {
        try {
            const updatedTask = await this.propertyRepository.updateTask(taskId, {
                status: 'Pendiente',
                completedAt: null // Very important for stats
            });
            console.log(`⏪ Task ${taskId} marked as pending.`);
            return updatedTask;
        } catch (error) {
            console.error(`Error reverting task ${taskId}:`, error);
            throw error;
        }
    }

    /**
     * A specific service to quickly update only the room status.
     * @param {number|string} roomId - The ID of the room.
     * @param {string} status - The new status (e.g., 'available', 'cleaning').
     * @returns {Promise<object>} The updated room object.
     */
    async updateRoomStatus(roomId, status) {
        try {
            console.log(`Service: Updating room ${roomId} status to ${status}`);
            return await this.propertyRepository.updateRoom(roomId, { status: status });
        } catch (error) {
            console.error(`Error updating room status:`, error);
            throw error;
        }
    }


    // [REFACTORIZADO] getTaskStats ahora es dinámico
    async getTaskStats(staffId, period = 'week', t) {
        if (!staffId) return { kpi: { daily: 0, weekly: 0, monthly: 0, yearly: 0 }, chartData: {} };

        const tasks = await this.propertyRepository.getTasks(staffId);
        const completedTasks = tasks.filter(t => t.status === 'Completada' && t.completedAt);

        const kpi = { daily: 0, weekly: 0, monthly: 0, yearly: 0 };

        // --- Lógica de KPI (Corregida para evitar mutación de 'now') ---
        const today_clean = new Date();
        const todayStart_clean = new Date(today_clean.getFullYear(), today_clean.getMonth(), today_clean.getDate());

        const week_clean = new Date();
        const dayOfWeek_clean = week_clean.getDay(); // 0=Domingo, 1=Lunes
        const diff_clean = week_clean.getDate() - dayOfWeek_clean + (dayOfWeek_clean === 0 ? -6 : 1); // Lunes
        const weekStart_clean = new Date(week_clean.getFullYear(), week_clean.getMonth(), diff_clean);

        const month_clean = new Date();
        const monthStart_clean = new Date(month_clean.getFullYear(), month_clean.getMonth(), 1);

        const year_clean = new Date();
        const yearStart_clean = new Date(year_clean.getFullYear(), 0, 1);

        for (const task of completedTasks) {
            const completedDate = new Date(task.completedAt);
            if (completedDate >= todayStart_clean) kpi.daily++;
            if (completedDate >= weekStart_clean) kpi.weekly++;
            if (completedDate >= monthStart_clean) kpi.monthly++;
            if (completedDate >= yearStart_clean) kpi.yearly++;
        }

        // --- Generación Dinámica de Gráfica ---
        const chartData = { labels: [], datasets: [{ label: t('tasks.filterCompleted'), data: [], backgroundColor: '#1ABC9C', borderColor: '#1ABC9C' }] };
        const dataMap = new Map();

        switch (period) {
            case 'today':
                // Gráfica por horas (bloques de 3 horas)
                chartData.labels = ['0-3', '3-6', '6-9', '9-12', '12-15', '15-18', '18-21', '21-24'];
                chartData.labels.forEach(l => dataMap.set(l, 0));

                completedTasks
                    .filter(t => new Date(t.completedAt) >= todayStart_clean)
                    .forEach(t => {
                        const hour = new Date(t.completedAt).getHours();
                        const bucket = Math.floor(hour / 3); // 0-7
                        const label = chartData.labels[bucket];
                        dataMap.set(label, dataMap.get(label) + 1);
                    });
                break;

            case 'month':
                // Gráfica por semanas del mes
                chartData.labels = [t('tasks.week') + ' 1', t('tasks.week') + ' 2', t('tasks.week') + ' 3', t('tasks.week') + ' 4+'];
                chartData.labels.forEach(l => dataMap.set(l, 0));

                completedTasks
                    .filter(t => new Date(t.completedAt) >= monthStart_clean)
                    .forEach(t => {
                        const dayOfMonth = new Date(t.completedAt).getDate();
                        let label;
                        if (dayOfMonth <= 7) label = chartData.labels[0];
                        else if (dayOfMonth <= 14) label = chartData.labels[1];
                        else if (dayOfMonth <= 21) label = chartData.labels[2];
                        else label = chartData.labels[3];
                        dataMap.set(label, dataMap.get(label) + 1);
                    });
                break;

            case 'year':
                // Gráfica por meses
                chartData.labels = [t('tasks.monthJan'), t('tasks.monthFeb'), t('tasks.monthMar'), t('tasks.monthApr'), t('tasks.monthMay'), t('tasks.monthJun'), t('tasks.monthJul'), t('tasks.monthAug'), t('tasks.monthSep'), t('tasks.monthOct'), t('tasks.monthNov'), t('tasks.monthDec')];
                chartData.labels.forEach(l => dataMap.set(l, 0));

                completedTasks
                    .filter(t => new Date(t.completedAt) >= yearStart_clean)
                    .forEach(t => {
                        const month = new Date(t.completedAt).getMonth(); // 0-11
                        const label = chartData.labels[month];
                        dataMap.set(label, dataMap.get(label) + 1);
                    });
                break;

            case 'week': // Por defecto: últimos 7 días
            default:
                const dayLabels = [t('tasks.day6'), t('tasks.day5'), t('tasks.day4'), t('tasks.day3'), t('tasks.day2'), t('tasks.day1'), t('tasks.filterToday')];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateString = d.toISOString().split('T')[0];
                    const label = dayLabels[6-i]; // Asigna la etiqueta legible
                    chartData.labels.push(label);
                    dataMap.set(dateString, 0); // Usa la fecha real como clave
                }

                completedTasks.forEach(t => {
                    const completedDateString = t.completedAt.split('T')[0];
                    if (dataMap.has(completedDateString)) {
                        dataMap.set(completedDateString, dataMap.get(completedDateString) + 1);
                    }
                });
                // Saca los valores en el orden de las etiquetas
                chartData.data = chartData.labels.map((label, index) => {
                    const dateStringKey = [...dataMap.keys()][index];
                    return dataMap.get(dateStringKey);
                });
                break;
        }

        // Asigna los datos al gráfico (excepto para 'week' que ya se hizo)
        if (period !== 'week') {
            chartData.datasets[0].data = Array.from(dataMap.values());
        } else {
            chartData.datasets[0].data = chartData.data; // Asigna desde la variable temporal
            delete chartData.data; // Limpia
        }

        return { kpi, chartData };
    }

    // --- Métodos de Soporte a la App de Staff ---
    async getAssignedRoomsForStaff() {
        const allRooms = await this.propertyRepository.getRooms();
        // Filtra por los estados que definen una habitación como "pendiente" para el staff
        return allRooms.filter(room => room.status === 'Por limpiar' || room.status === 'Revisión pendiente' || room.status === 'cleaning');
    }
}