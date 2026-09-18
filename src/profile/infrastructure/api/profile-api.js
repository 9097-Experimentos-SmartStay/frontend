import { BaseApi } from '../../../shared/infrastructure/services/base-api.js';
import { ProfileResource, CreateProfileResource } from '../profile.resource.js';

const http = new BaseApi().http;
const profilesEndpointPath = import.meta.env.VITE_PROFILES_ENDPOINT_PATH;

/**
 * Profile API Service
 * Handles all HTTP requests related to profiles
 */
export class ProfileApi {
    /**
     * Gets a profile by its ID
     * @param {number} profileId - Profile unique identifier
     * @returns {Promise<ProfileResource>} Profile resource
     */
    static async getProfileById(profileId) {
        try {
            const response = await http.get(`${profilesEndpointPath}/${profileId}`);
            return ProfileResource.fromJSON(response.data);
        } catch (error) {
            console.error('Error fetching profile by ID:', error);
            throw error;
        }
    }

    /**
     * Gets all profiles
     * @returns {Promise<ProfileResource[]>} Array of profile resources
     */
    static async getAllProfiles() {
        try {
            const response = await http.get(profilesEndpointPath);
            return response.data.map(profile => ProfileResource.fromJSON(profile));
        } catch (error) {
            console.error('Error fetching all profiles:', error);
            throw error;
        }
    }

    /**
     * Creates a new profile
     * @param {CreateProfileResource} createProfileResource - Profile data to create
     * @returns {Promise<ProfileResource>} Created profile resource
     */
    static async createProfile(createProfileResource) {
        try {
            const response = await http.post(
                profilesEndpointPath,
                createProfileResource.toJSON()
            );
            return ProfileResource.fromJSON(response.data);
        } catch (error) {
            console.error('Error creating profile:', error);
            throw error;
        }
    }

    /**
     * Gets a profile by email address
     * @param {string} email - Email address
     * @returns {Promise<ProfileResource|null>} Profile resource or null if not found
     */
    static async getProfileByEmail(email) {
        try {
            const profiles = await this.getAllProfiles();
            return profiles.find(profile => profile.email === email) || null;
        } catch (error) {
            console.error('Error fetching profile by email:', error);
            throw error;
        }
    }
}
