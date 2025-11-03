// src/modules/guest/application/guest_service.js
import { guestRepository } from "../domain/guest_repository.js";

export const guestService = {
    async getAvailableProperties() {
        return await guestRepository.getProperties();
    },

    async getMyBookings(guestId) {
        return await guestRepository.getBookings(guestId);
    },

    async getActiveServices(guestId) {
        return await guestRepository.getActiveServices(guestId);
    }
};
