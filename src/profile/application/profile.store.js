import { defineStore } from 'pinia';
import { ProfileApi } from '../infrastructure/api/profile-api.js';
import { ProfileAssembler } from '../infrastructure/profile.assembler.js';
import { CreateProfileResource } from '../infrastructure/profile.resource.js';

/**
 * Profile Store
 * Manages the state and actions for profiles
 */
export const useProfileStore = defineStore('profile', {
    state: () => ({
        profiles: [],
        currentProfile: null,
        loading: false,
        error: null
    }),

    getters: {
        /**
         * Gets all profiles
         * @param {Object} state - Store state
         * @returns {Array} Array of profiles
         */
        allProfiles: (state) => state.profiles,

        /**
         * Gets the current profile
         * @param {Object} state - Store state
         * @returns {Object|null} Current profile or null
         */
        getCurrentProfile: (state) => state.currentProfile,

        /**
         * Checks if loading
         * @param {Object} state - Store state
         * @returns {boolean} Loading status
         */
        isLoading: (state) => state.loading,

        /**
         * Gets error message
         * @param {Object} state - Store state
         * @returns {string|null} Error message or null
         */
        getError: (state) => state.error,

        /**
         * Gets profile by ID
         * @param {Object} state - Store state
         * @returns {Function} Function to get profile by ID
         */
        getProfileById: (state) => (id) => {
            return state.profiles.find(profile => profile.id === id);
        }
    },

    actions: {
        /**
         * Fetches all profiles from the API
         */
        async fetchAllProfiles() {
            this.loading = true;
            this.error = null;
            try {
                const profileResources = await ProfileApi.getAllProfiles();
                this.profiles = ProfileAssembler.toEntitiesFromResources(profileResources);
            } catch (error) {
                this.error = error.message || 'Error fetching profiles';
                console.error('Error in fetchAllProfiles:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Fetches a profile by ID
         * @param {number} profileId - Profile ID
         */
        async fetchProfileById(profileId) {
            this.loading = true;
            this.error = null;
            try {
                const profileResource = await ProfileApi.getProfileById(profileId);
                const profile = ProfileAssembler.toEntityFromResource(profileResource);
                this.currentProfile = profile;

                // Update in profiles array if exists
                const index = this.profiles.findIndex(p => p.id === profileId);
                if (index !== -1) {
                    this.profiles[index] = profile;
                } else {
                    this.profiles.push(profile);
                }
            } catch (error) {
                this.error = error.message || 'Error fetching profile';
                console.error('Error in fetchProfileById:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Creates a new profile
         * @param {Object} profileData - Profile data
         * @returns {Promise<Object>} Created profile
         */
        async createProfile(profileData) {
            this.loading = true;
            this.error = null;
            try {
                const createResource = CreateProfileResource.fromFormData(profileData);
                const profileResource = await ProfileApi.createProfile(createResource);
                const profile = ProfileAssembler.toEntityFromResource(profileResource);

                this.profiles.push(profile);
                this.currentProfile = profile;

                return profile;
            } catch (error) {
                this.error = error.message || 'Error creating profile';
                console.error('Error in createProfile:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Fetches profile by email
         * @param {string} email - Email address
         */
        async fetchProfileByEmail(email) {
            this.loading = true;
            this.error = null;
            try {
                const profileResource = await ProfileApi.getProfileByEmail(email);
                if (profileResource) {
                    const profile = ProfileAssembler.toEntityFromResource(profileResource);
                    this.currentProfile = profile;
                } else {
                    this.currentProfile = null;
                }
            } catch (error) {
                this.error = error.message || 'Error fetching profile by email';
                console.error('Error in fetchProfileByEmail:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Sets the current profile
         * @param {Object} profile - Profile to set as current
         */
        setCurrentProfile(profile) {
            this.currentProfile = profile;
        },

        /**
         * Clears the current profile
         */
        clearCurrentProfile() {
            this.currentProfile = null;
        },

        /**
         * Clears all profiles
         */
        clearProfiles() {
            this.profiles = [];
            this.currentProfile = null;
            this.error = null;
        }
    }
});