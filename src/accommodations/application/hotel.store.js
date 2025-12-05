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
    const categories = ref([]);
    const amenitiesList = ref([]);

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
        createAmenity
    };
});