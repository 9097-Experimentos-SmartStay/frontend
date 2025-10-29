// src/modules/auth/infrastructure/repositories/ProfileApiRepository.js
import { IProfileRepository } from "./IProfileRepository.js";
import { profileApi } from "../../infrastructure/api/profileApi.js";

export class ProfileApiRepository extends IProfileRepository {
    async getProfileByUserId(userId) {
        return await profileApi.fetchProfileByUserId(userId);
    }
    async getAllProfiles() {
        return await profileApi.fetchAllProfiles();
    }
}