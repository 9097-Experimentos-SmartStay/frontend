import { httpClient } from '@/shared/infrastructure/http/http-client.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';
import { ProfileResource } from '../profile.resource.js';

// TODO(phase-2b): the backend exposes guests and staff instead of /profiles.
// Paths and payloads stay as they were until the API contract is settled.
const profilesEndpointPath = endpoints.profiles;

/**
 * Profile API Service.
 * Uses the shared HTTP client, so requests go to VITE_SMARTSTAY_API_URL with the auth header.
 */
export class ProfileApi {
    /**
     * Gets a profile by its ID
     * @param {number} profileId - Profile unique identifier
     * @returns {Promise<ProfileResource>} Profile resource
     */
    static async getProfileById(profileId) {
        const response = await httpClient.get(`${profilesEndpointPath}/${profileId}`);
        return ProfileResource.fromJSON(response.data);
    }

    /**
     * Gets all profiles
     * @returns {Promise<ProfileResource[]>} Array of profile resources
     */
    static async getAllProfiles() {
        const response = await httpClient.get(profilesEndpointPath);
        return response.data.map(profile => ProfileResource.fromJSON(profile));
    }

    /**
     * Creates a new profile
     * @param {import('../profile.resource.js').CreateProfileResource} createProfileResource - Profile data to create
     * @returns {Promise<ProfileResource>} Created profile resource
     */
    static async createProfile(createProfileResource) {
        const response = await httpClient.post(profilesEndpointPath, createProfileResource.toJSON());
        return ProfileResource.fromJSON(response.data);
    }

    /**
     * Gets a profile by email address
     * @param {string} email - Email address
     * @returns {Promise<ProfileResource|null>} Profile resource or null if not found
     */
    static async getProfileByEmail(email) {
        const profiles = await this.getAllProfiles();
        return profiles.find(profile => profile.email === email) || null;
    }
}
