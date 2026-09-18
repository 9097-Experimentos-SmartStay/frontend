import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RoomApi } from '../infrastructure/api/room-api.js';
import { RoomTypeApi } from '../infrastructure/api/room-type-api.js';
import { AccommodationOptionsApi } from '../infrastructure/api/accommodation-options-api.js';
import { RoomAssembler } from '../infrastructure/room.assembler.js';
import { RoomTypeAssembler } from '../infrastructure/room-type.assembler.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

// Infrastructure Services
const roomApi = new RoomApi();
const roomTypeApi = new RoomTypeApi();
const optionsApi = new AccommodationOptionsApi();

/**
 * Pinia Store for Room Management within the Accommodations Bounded Context.
 * Handles state management, business logic, and communication with the Infrastructure Layer.
 * Maps Infrastructure Resources to Domain Entities.
 * @returns {Object} The room store composable with state and actions.
 */
export const useRoomStore = defineStore('room', () => {

    // --- State ---

    /** @type {import('vue').Ref<Array<Room>>} rooms - List of Room Domain Entities. */
    const rooms = ref([]);

    /** @type {import('vue').Ref<Array<RoomType>>} roomTypes - List of RoomType Domain Entities. */
    const roomTypes = ref([]);

    /** @type {import('vue').Ref<Array<string>>} amenitiesList - List of available amenity names (Master Data). */
    const amenitiesList = ref([]);

    /** @type {import('vue').Ref<Room|null>} currentRoom - The currently selected Room Entity. */
    const currentRoom = ref(null);

    /** @type {import('vue').Ref<boolean>} loading - Loading state indicator. */
    const loading = ref(false);

    /** @type {import('vue').Ref<Error|null>} error - Error state. */
    const error = ref(null);

    // --- Actions ---

    /**
     * Fetches all rooms from the infrastructure and updates the state with Domain Entities.
     * @returns {Promise<void>}
     */
    async function fetchAllRooms() {
        loading.value = true;
        error.value = null;
        try {
            const response = await roomApi.getAll();
            rooms.value = RoomAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            reportError('Error fetching rooms', err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetches a specific room by ID.
     * @param {number} id - The unique identifier of the room.
     * @returns {Promise<void>}
     */
    async function fetchRoomById(id) {
        loading.value = true;
        error.value = null;
        try {
            const response = await roomApi.getById(id);
            currentRoom.value = RoomAssembler.toEntityFromResponse(response);
        } catch (err) {
            reportError(`Error fetching room ${id}`, err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetches all available Room Types (Master Data).
     * @returns {Promise<void>}
     */
    async function fetchAllRoomTypes() {
        try {
            const response = await roomTypeApi.getAll();
            roomTypes.value = RoomTypeAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            reportError('Error fetching room types', err);
        }
    }

    /**
     * Fetches the catalog of available amenities.
     * @returns {Promise<void>}
     */
    async function fetchAmenities() {
        try {
            const response = await optionsApi.getAmenities();
            amenitiesList.value = response.data;
        } catch (err) {
            reportError('Error fetching amenities', err);
        }
    }

    /**
     * Creates a new Room Entity.
     * Validates domain constraints before sending the resource to the infrastructure.
     * @param {Object} roomData - The data required to create a room.
     * @param {number} roomData.roomTypeId - The ID of the room type.
     * @param {string} roomData.description - The description of the room.
     * @returns {Promise<Room>} The newly created Room Entity.
     */
    async function createRoom(roomData) {
        loading.value = true;
        try {
            // Domain Validation Logic
            if (!roomData.roomTypeId) throw new Error('Room Type is required');
            if (!roomData.description) throw new Error('Description is required');

            const response = await roomApi.create(roomData);
            const newRoom = RoomAssembler.toEntityFromResponse(response);

            if(newRoom) {
                rooms.value.push(newRoom);
            }
            return newRoom;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Creates a new Room Type in the system.
     * @param {Object} typeData - The payload containing name and description.
     * @param {string} typeData.name - The name of the room type.
     * @param {string} typeData.description - The description of the room type.
     * @returns {Promise<RoomType>} The newly created RoomType Entity.
     */
    async function createRoomType(typeData) {
        loading.value = true;
        try {
            const response = await roomTypeApi.create(typeData);
            const newType = RoomTypeAssembler.toEntityFromResponse(response);

            // Optimistic update or refresh list
            if(newType) {
                roomTypes.value.push(newType);
            }
            return newType;
        } catch (err) {
            reportError('Error creating room type', err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Creates a new Amenity in the master catalog.
     * @param {string} name - The name of the new amenity.
     * @returns {Promise<void>}
     */
    async function createAmenity(name) {
        loading.value = true;
        try {
            await optionsApi.createAmenity({ name });
            // Refresh the list to make it available immediately
            await fetchAmenities();
        } catch (err) {
            reportError('Error creating amenity', err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Updates an existing Room Entity.
     * @param {number} id - The unique identifier of the room.
     * @param {Object} roomData - The payload containing updated fields.
     * @returns {Promise<Room>} The updated Room Entity.
     */
    async function updateRoom(id, roomData) {
        loading.value = true;
        try {
            const response = await roomApi.update(id, roomData);
            const updatedRoom = RoomAssembler.toEntityFromResponse(response);

            // Optimistic Update: Update local state
            const index = rooms.value.findIndex(r => r.id === id);
            if (index !== -1 && updatedRoom) {
                rooms.value[index] = updatedRoom;
            }
            return updatedRoom;
        } catch (err) {
            reportError(`Error updating room ${id}`, err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Deletes a Room Entity.
     * @param {number} id - The unique identifier of the room to delete.
     * @returns {Promise<void>}
     */
    async function deleteRoom(id) {
        loading.value = true;
        try {
            await roomApi.delete(id);

            // Update local state immediately
            rooms.value = rooms.value.filter(r => r.id !== id);
        } catch (err) {
            reportError(`Error deleting room ${id}`, err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        // State
        rooms,
        roomTypes,
        amenitiesList,
        currentRoom,
        loading,
        error,

        // Actions
        fetchAllRooms,
        fetchRoomById,
        fetchAllRoomTypes,
        fetchAmenities,
        createRoom,
        createRoomType,
        createAmenity,
        updateRoom,
        deleteRoom
    };
});