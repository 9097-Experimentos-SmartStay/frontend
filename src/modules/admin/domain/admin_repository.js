export const adminRepository = {
    getAllStaff() {
        return [
            { id: 1, name: "María Pérez", role: "Recepcionista" },
            { id: 2, name: "Luis García", role: "Mantenimiento" }
        ];
    },

    getRooms() {
        return [
            { id: 1, number: 101, status: "Disponible" },
            { id: 2, number: 102, status: "Ocupada" }
        ];
    }
};
