// src/modules/auth/infrastructure/repositories/ProfileApiRepository.js
import { IProfileRepository } from "../../domain/repositories/IProfileRepository.js";
import { profileApi } from "../api/profileApi.js";

export class ProfileApiRepository extends IProfileRepository {
    async getProfileByUserId(userId) {
        return await profileApi.fetchProfileByUserId(userId);
    }
    async getAllProfiles() {
        return await profileApi.fetchAllProfiles();
    }
    async deleteProfileByUserId(userId) {
        await profileApi.removeProfileByUserId(userId);
    }
    async createProfile(profileData) {
        return await profileApi.postProfile(profileData);
    }
}