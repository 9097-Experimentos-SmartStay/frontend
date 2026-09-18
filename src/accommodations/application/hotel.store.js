import { defineStore } from 'pinia';
import { ref } from 'vue';
import { HotelApi } from '../infrastructure/api/hotel-api.js';
import { AccommodationOptionsApi } from '../infrastructure/api/accommodation-options-api.js';
import { HotelAssembler } from '../infrastructure/hotel.assembler.js';
import { uploadImage } from '@/shared/infrastructure/services/image-upload.service.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';
import { OperationFailure } from '@/shared/application/operation-failure.js';
import { classifyAccommodationProblem, hotelFieldViolations } from '../infrastructure/accommodation-problem.assembler.js';

/** @param {unknown} error @returns {OperationFailure} */
const hotelFailure = (error) => OperationFailure.from(error, { classify: classifyAccommodationProblem, fields: hotelFieldViolations });
import useIamStore from '@/iam/application/iam.store.js';
import { UserRole } from '@/iam/domain/user-role.js';

const hotelApi = new HotelApi();
const optionsApi = new AccommodationOptionsApi();

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
            reportError('Error fetching hotels', err);
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
        currentHotel.value = null;
        try {
            const response = await hotelApi.getById(id);
            currentHotel.value = HotelAssembler.toEntityFromResponse(response);
        } catch (err) {
            reportError(`Error fetching hotel ${id}`, err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Registers a hotel (POST /hotels).
     * D2: an admin can register ONE hotel, which becomes their `hotelId`; a second one answers 409. The admin's
     * token carries no hotel, so the backend ends their sessions: the session of this browser ends here too and
     * the view sends them to sign in again (their new token brings the hotel).
     * @param {Object} form - See HotelAssembler.toSaveResource.
     * @returns {Promise<Hotel>} The created hotel entity.
     * @throws {OperationFailure} hotelAlreadyRegistered (409, D2) | invalidData (per field) | forbidden
     */
    async function createHotel(form) {
        loading.value = true;
        try {
            const response = await hotelApi.create(HotelAssembler.toSaveResource(form));
            const newHotel = HotelAssembler.toEntityFromResponse(response);
            if (newHotel) {
                hotels.value.push(newHotel);
                const iamStore = useIamStore();
                if (iamStore.role === UserRole.ADMIN && iamStore.currentUser?.hotelId == null) {
                    iamStore.endSession();
                }
            }
            return newHotel;
        } catch (err) {
            reportError('Error creating hotel', err);
            const failure = hotelFailure(err);
            error.value = failure;
            throw failure;
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
                optionsApi.getCategories(),
                optionsApi.getAmenities()
            ]);
            // The backend returns plain string arrays: ["Hotel", "Resort"]
            categories.value = catResponse.data;
            amenitiesList.value = amResponse.data;
        } catch (err) {
            reportError('Error fetching options', err);
        }
    }

    /**
     * Creates a new hotel category.
     * @param {string} name - Name of the category.
     * @returns {Promise<void>}
     */
    async function createCategory(name) {
        try {
            await optionsApi.createCategory({ name });
            // Reload so the new category shows up in the select
            await fetchOptions();
        } catch (err) {
            reportError('Error creating category', err);
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
            await optionsApi.createAmenity({ name });
            // Refresh options to show the new amenity immediately
            await fetchOptions();
        } catch (err) {
            reportError('Error creating amenity', err);
            throw err;
        }
    }

    /**
     * Updates an existing hotel.
     * @param {number} id - The ID of the hotel to update.
     * @param {Object} hotelData - Form data (see HotelAssembler.toSaveResource).
     * @returns {Promise<Hotel>} The updated hotel entity.
     */
    async function updateHotel(id, hotelData) {
        loading.value = true;
        try {
            const response = await hotelApi.update(id, HotelAssembler.toSaveResource(hotelData));
            const updatedHotel = HotelAssembler.toEntityFromResponse(response);

            // Optimistic Update: Update the item in the local list
            const index = hotels.value.findIndex(h => h.id === id);
            if (index !== -1 && updatedHotel) {
                hotels.value[index] = updatedHotel;
            }
            return updatedHotel;
        } catch (err) {
            reportError(`Error updating hotel ${id}`, err);
            throw hotelFailure(err);
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
            reportError(`Error deleting hotel ${id}`, err);
            throw hotelFailure(err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Uploads a hotel photo and returns its public URL.
     * @param {File} file - The image file selected by the user.
     * @returns {Promise<string>} The image URL to store in the hotel.
     */
    async function uploadHotelImage(file) {
        return uploadImage(file);
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
        deleteHotel,
        uploadHotelImage
    };
});