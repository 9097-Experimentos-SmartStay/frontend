// src/modules/auth/domain/repositories/IProfileRepository.js
export class IProfileRepository {
    getProfileByUserId(userId) { throw new Error("Not implemented"); }
    getAllProfiles() { throw new Error("Not implemented"); }
    deleteProfileByUserId(userId) { throw new Error("Not implemented: deleteProfileByUserId"); }
    createProfile(profileData) { throw new Error("Not implemented: createProfile"); }
}