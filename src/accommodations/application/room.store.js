import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RoomApi } from '../infrastructure/api/room-api.js';
import { RoomTypeApi } from '../infrastructure/api/room-type-api.js';
import { RoomAssembler } from '../infrastructure/room.assembler.js';
import { RoomTypeAssembler } from '../infrastructure/room-type.assembler.js';

const roomApi = new RoomApi();
const roomTypeApi = new RoomTypeApi();

export const useRoomStore = defineStore('room', () => {

    // --- State ---
    const rooms = ref([]);
    const roomTypes = ref([]);
    const currentRoom = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // --- Actions ---

    // 1. Fetch All Rooms
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

    // 2. Fetch Room by ID
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

    // 3. Fetch Room Types (Para filtros)
    async function fetchAllRoomTypes() {
        try {
            const response = await roomTypeApi.getAll();
            roomTypes.value = RoomTypeAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error('Error fetching room types:', err);
        }
    }

    // 4. Create Room
    async function createRoom(roomData) {
        loading.value = true;
        try {
            // Domain Validation
            if (!roomData.roomTypeId) throw new Error('Room Type is required');
            if (!roomData.description) throw new Error('Description is required');

            const response = await roomApi.create(roomData);
            const newRoom = RoomAssembler.toEntityFromResponse(response);
            if(newRoom) rooms.value.push(newRoom);
            return newRoom;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        rooms,
        roomTypes,
        currentRoom,
        loading,
        error,
        fetchAllRooms,
        fetchRoomById,
        fetchAllRoomTypes,
        createRoom
    };
});