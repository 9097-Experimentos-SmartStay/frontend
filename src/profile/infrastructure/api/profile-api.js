import { BaseApi } from '@/shared/infrastructure/services/base-api.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';

const guestsPath = endpoints.guests;
const staffPath = endpoints.staff;

/**
 * Profiles live in two resources (§11, §12): /guests (guest profiles) and /staff (staff profiles).
 */
export class ProfileApi extends BaseApi {
    /**
     * GET /guests/user/{userId}. 404 when the user has no profile (or it is not theirs).
     * @param {number} userId
     */
    getGuestProfileByUserId(userId) {
        return this.http.get(`${guestsPath}/user/${userId}`);
    }

    /** GET /guests (reception, admin, chain_admin). */
    getGuestProfiles() {
        return this.http.get(guestsPath);
    }

    /**
     * POST /guests. For a guest the owner is the caller (no `userId`).
     * @param {Object} resource
     */
    createGuestProfile(resource) {
        return this.http.post(guestsPath, resource);
    }

    /**
     * GET /staff/user/{userId} (admin, chain_admin only).
     * @param {number} userId
     */
    getStaffProfileByUserId(userId) {
        return this.http.get(`${staffPath}/user/${userId}`);
    }
}
