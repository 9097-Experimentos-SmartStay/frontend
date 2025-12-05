import { defineStore } from 'pinia';
import { ref } from 'vue';
import { HotelApi } from '../infrastructure/api/hotel-api.js';
import { HotelAssembler } from '../infrastructure/hotel.assembler.js';

const hotelApi = new HotelApi();

/**
 * Pinia Store for Hotel Management.
 * Handles state management and business logic for Hotels.
 * @returns {Object} The hotel store composable with state and actions.
 */
export const useHotelStore = defineStore('hotel', () => {

    // --- State ---
    /**
     * @type {import('vue').Ref<Array<Hotel>>} hotels - List of all hotels.
     */
    const hotels = ref([]);
    /**
     * @type {import('vue').Ref<Hotel|null>} currentHotel - The currently selected hotel.
     */
    const currentHotel = ref(null);
    /**
     * @type {import('vue').Ref<boolean>} loading - Indicates if an operation is in progress.
     */
    const loading = ref(false);
    /**
     * @type {import('vue').Ref<Error|null>} error - The last error encountered.
     */
    const error = ref(null);
    /**
     * @type {import('vue').Ref<Array<string>>} categories - List of hotel categories.
     */
    const categories = ref([]);
    /**
     * @type {import('vue').Ref<Array<string>>} amenitiesList - List of available amenities.
     */
    const amenitiesList = ref([]);

    // --- Actions ---

    /**
     * Fetches all hotels from the API and updates state.
     * @returns {Promise<void>}
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
     * @param {number} id - The unique identifier of the hotel.
     * @returns {Promise<void>}
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
     * @param {Object} hotelData - The data for the new hotel.
     * @param {string} hotelData.name - The name of the hotel.
     * @param {string} hotelData.address - The address.
     * @param {string} hotelData.city - The city.
     * @param {string} hotelData.country - The country.
     * @returns {Promise<Hotel>} The created hotel entity.
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

    /**
     * Fetches hotel categories and amenities.
     * @returns {Promise<void>}
     */
    async function fetchOptions() {
        try {
            const [catResponse, amResponse] = await Promise.all([
                hotelApi.getHotelCategories(),
                hotelApi.getAmenities()
            ]);
            // El backend devuelve array de strings directo: ["Hotel", "Resort"]
            categories.value = catResponse.data;
            amenitiesList.value = amResponse.data;
        } catch (err) {
            console.error('Error fetching options:', err);
        }
    }

    /**
     * Creates a new hotel category.
     * @param {string} name - Name of the category.
     * @returns {Promise<void>}
     */
    async function createCategory(name) {
        try {
            // Asumiendo que tienes un endpoint POST /api/v1/accommodations/options/categories
            // Si no lo tienes, el backend fallará. Asegúrate de crearlo.
            await hotelApi.createCategory({ name });

            // Recargamos la lista para que aparezca en el select
            await fetchOptions();
        } catch (err) {
            console.error('Error creating category:', err);
            throw err;
        }
    }

    /**
     * Creates a new amenity in the master catalog.
     * @param {string} name - Name of the amenity.
     * @returns {Promise<void>}
     */
    async function createAmenity(name) {
        try {
            await hotelApi.createAmenity({ name });
            // Refresh options to show the new amenity immediately
            await fetchOptions();
        } catch (err) {
            console.error('Error creating amenity:', err);
            throw err;
        }
    }

    /**
     * Updates an existing hotel.
     * @param {number} id - The ID of the hotel to update.
     * @param {Object} hotelData - The updated data (UpdateHotelResource).
     * @returns {Promise<Hotel>} The updated hotel entity.
     */
    async function updateHotel(id, hotelData) {
        loading.value = true;
        try {
            // Validation Logic could go here

            const response = await hotelApi.update(id, hotelData);
            const updatedHotel = HotelAssembler.toEntityFromResponse(response);

            // Optimistic Update: Update the item in the local list
            const index = hotels.value.findIndex(h => h.id === id);
            if (index !== -1 && updatedHotel) {
                hotels.value[index] = updatedHotel;
            }
            return updatedHotel;
        } catch (err) {
            console.error(`Error updating hotel ${id}:`, err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Deletes a hotel.
     * @param {number} id - The ID of the hotel to delete.
     * @returns {Promise<void>}
     */
    async function deleteHotel(id) {
        loading.value = true;
        try {
            await hotelApi.delete(id);

            // Remove from local state immediately
            hotels.value = hotels.value.filter(h => h.id !== id);
        } catch (err) {
            console.error(`Error deleting hotel ${id}:`, err);
            throw err;
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
        createHotel,
        categories,
        amenitiesList,
        fetchOptions,
        createCategory,
        createAmenity,
        updateHotel,
        deleteHotel
    };
});