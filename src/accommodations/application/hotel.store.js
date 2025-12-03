import { defineStore } from 'pinia';
import { ref } from 'vue';
import { HotelApi } from '../infrastructure/api/hotel-api.js';
import { HotelAssembler } from '../infrastructure/hotel.assembler.js';

const hotelApi = new HotelApi();

/**
 * Pinia Store for Hotel Management.
 * Handles state management and business logic for Hotels.
 */
export const useHotelStore = defineStore('hotel', () => {

    // --- State ---
    const hotels = ref([]);
    const currentHotel = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // --- Actions ---

    /**
     * Fetches all hotels from the API and updates state.
     */
    async function fetchAllHotels() {
        loading.value = true;
        error.value = null;
        try {
            const response = await hotelApi.getAll();
            // Assembler transforms API Resource -> Domain Entity
            hotels.value = HotelAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error('Error fetching hotels:', err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetches a single hotel by ID.
     * @param {number} id
     */
    async function fetchHotelById(id) {
        loading.value = true;
        try {
            const response = await hotelApi.getById(id);
            currentHotel.value = HotelAssembler.toEntityFromResponse(response);
        } catch (err) {
            console.error(`Error fetching hotel ${id}:`, err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Creates a new hotel.
     * Includes Domain Validation logic (previously in Service).
     * @param {Object} hotelData
     */
    async function createHotel(hotelData) {
        loading.value = true;
        try {
            // --- Domain Validation Logic ---
            if (!hotelData.name) {
                throw new Error('Hotel name is required');
            }
            if (!hotelData.address || !hotelData.city || !hotelData.country) {
                throw new Error('Full location (Address, City, Country) is required');
            }

            // --- API Call ---
            const response = await hotelApi.create(hotelData);

            // Update state with the new entity
            const newHotel = HotelAssembler.toEntityFromResponse(response);
            if (newHotel) {
                hotels.value.push(newHotel);
            }
            return newHotel;
        } catch (err) {
            console.error('Error creating hotel:', err);
            error.value = err;
            throw err; // Re-throw to handle in UI (e.g., Toast)
        } finally {
            loading.value = false;
        }
    }

    return {
        hotels,
        currentHotel,
        loading,
        error,
        fetchAllHotels,
        fetchHotelById,
        createHotel
    };
});