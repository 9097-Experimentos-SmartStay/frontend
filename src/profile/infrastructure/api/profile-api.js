import axios from 'axios';
import { ProfileResource, CreateProfileResource } from '../profile.resource.js';

const API_BASE_URL = 'http://localhost:5192/api/v1';

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
            const response = await axios.get(`${API_BASE_URL}/profiles/${profileId}`);
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
            const response = await axios.get(`${API_BASE_URL}/profiles`);
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
            const response = await axios.post(
                `${API_BASE_URL}/profiles`,
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