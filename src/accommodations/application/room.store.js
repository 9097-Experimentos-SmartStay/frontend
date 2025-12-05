import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RoomApi } from '../infrastructure/api/room-api.js';
import { RoomTypeApi } from '../infrastructure/api/room-type-api.js';
import { RoomAssembler } from '../infrastructure/room.assembler.js';
import { RoomTypeAssembler } from '../infrastructure/room-type.assembler.js';

// Infrastructure Services
const roomApi = new RoomApi();
const roomTypeApi = new RoomTypeApi();

/**
 * Pinia Store for Room Management within the Accommodations Bounded Context.
 * Handles state management, business logic, and communication with the Infrastructure Layer.
 * Maps Infrastructure Resources to Domain Entities.
 */
export const useRoomStore = defineStore('room', () => {

    // --- State ---

    /** @type {import('vue').Ref<Array>} List of Room Domain Entities. */
    const rooms = ref([]);

    /** @type {import('vue').Ref<Array>} List of RoomType Domain Entities. */
    const roomTypes = ref([]);

    /** @type {import('vue').Ref<Array<string>>} List of available amenity names (Master Data). */
    const amenitiesList = ref([]);

    /** @type {import('vue').Ref<Object|null>} The currently selected Room Entity. */
    const currentRoom = ref(null);

    /** @type {import('vue').Ref<boolean>} Loading state indicator. */
    const loading = ref(false);

    /** @type {import('vue').Ref<Error|null>} Error state. */
    const error = ref(null);

    // --- Actions ---

    /**
     * Fetches all rooms from the infrastructure and updates the state with Domain Entities.
     */
    async function fetchAllRooms() {
        loading.value = true;
        error.value = null;
        try {
            const response = await roomApi.getAll();
            rooms.value = RoomAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetches a specific room by ID.
     * @param {number} id - The unique identifier of the room.
     */
    async function fetchRoomById(id) {
        loading.value = true;
        error.value = null;
        try {
            const response = await roomApi.getById(id);
            currentRoom.value = RoomAssembler.toEntityFromResponse(response);
        } catch (err) {
            console.error(`Error fetching room ${id}:`, err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetches all available Room Types (Master Data).
     */
    async function fetchAllRoomTypes() {
        try {
            const response = await roomTypeApi.getAll();
            roomTypes.value = RoomTypeAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error('Error fetching room types:', err);
        }
    }

    /**
     * Fetches the catalog of available amenities.
     * Uses the shared options endpoint via the configured HTTP client.
     */
    async function fetchAmenities() {
        try {
            // Accessing the Master Data endpoint via the configured http client
            const response = await roomApi.http.get('/accommodations/options/amenities');
            amenitiesList.value = response.data;
        } catch (err) {
            console.error('Error fetching amenities:', err);
        }
    }

    /**
     * Creates a new Room Entity.
     * Validates domain constraints before sending the resource to the infrastructure.
     * @param {Object} roomData - The data required to create a room.
     * @returns {Promise<Object>} The newly created Room Entity.
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
     * @returns {Promise<Object>} The newly created RoomType Entity.
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
            console.error('Error creating room type:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Creates a new Amenity in the master catalog.
     * @param {string} name - The name of the new amenity.
     */
    async function createAmenity(name) {
        loading.value = true;
        try {
            // Post to the shared options endpoint
            await roomApi.http.post('/accommodations/options/amenities', { name });
            // Refresh the list to make it available immediately
            await fetchAmenities();
        } catch (err) {
            console.error('Error creating amenity:', err);
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
        createAmenity
    };
});