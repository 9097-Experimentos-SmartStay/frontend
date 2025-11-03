// src/modules/guest/domain/guest_repository.js
import { guestApi } from "../infrastructure/guest_api.js";

export const guestRepository = {
    async getProperties() {
        console.log("📡 guestRepository: fetching properties from DB...");
        return await guestApi.fetchProperties();
    },

    async getBookings(guestId = null) {
        console.log("📡 guestRepository: fetching bookings from DB...");
        const allBookings = await guestApi.fetchBookings();
        if (!guestId) return allBookings;
        return allBookings.filter(b => b.guestId === guestId);
    },

    async getActiveServices(guestId) {
        console.log("📡 guestRepository: fetching active services for guest", guestId);
        // si tu API aún no tiene un endpoint de servicios, retorna arreglo vacío
        const res = await guestApi.fetchServices?.(guestId);
        return res || [];
    }
};
