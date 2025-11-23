// src/modules/staff/domain/staff_repository.js
export const staffRepository = {
    getTasks() {
        return [
            { id: 1, description: "Limpieza habitación 201", status: "Pendiente" },
            { id: 2, description: "Revisión aire acondicionado 105", status: "En proceso" },
        ];
    },

    getAssignedRooms() {
        return [
            { roomNumber: 201, status: "Por limpiar" },
            { roomNumber: 105, status: "Revisión pendiente" },
        ];
    }
};
