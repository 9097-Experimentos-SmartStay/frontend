export const guestRepository = {
    getProperties() {
        return [
            { id: 1, name: "Hotel Costa del Sol", city: "Lima", price: 200 },
            { id: 2, name: "Hostal El Valle", city: "Cusco", price: 120 },
        ];
    },

    getBookings() {
        return [
            { id: 10, property: "Hotel Costa del Sol", date: "2025-11-02", status: "Confirmada" },
        ];
    }
};
