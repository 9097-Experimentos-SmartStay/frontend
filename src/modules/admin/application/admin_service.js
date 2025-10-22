import { adminRepository } from "../domain/admin_repository.js";

export const adminService = {
    getStaffList() {
        return adminRepository.getAllStaff();
    },

    getRoomList() {
        return adminRepository.getRooms();
    }
};
