import { guestRepository } from "../domain/guest_repository.js";

export const guestService = {
    getAvailableProperties() {
        return guestRepository.getProperties();
    },

    getMyBookings() {
        return guestRepository.getBookings();
    }
};
