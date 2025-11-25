// src/bounded-contexts/accommodations/presentation/composables/useRooms.js
import { ref, onMounted } from 'vue';
import { RoomService } from '../../application/room-service.js';

export function useRooms() {
    const rooms = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const service = new RoomService();

    const fetchRooms = async () => {
        loading.value = true;
        error.value = null;
        try {
            rooms.value = await service.getAllRooms();
        } catch (err) {
            error.value = err.message || 'Error fetching rooms';
            console.error('Error fetching rooms:', err);
        } finally {
            loading.value = false;
        }
    };

    const getRoomById = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            return await service.getRoomById(id);
        } catch (err) {
            error.value = err.message || 'Error fetching room';
            console.error('Error fetching room:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const getRoomsByType = async (roomTypeId) => {
        loading.value = true;
        error.value = null;
        try {
            rooms.value = await service.getRoomsByType(roomTypeId);
        } catch (err) {
            error.value = err.message || 'Error fetching rooms by type';
            console.error('Error fetching rooms by type:', err);
        } finally {
            loading.value = false;
        }
    };

    const createRoom = async (data) => {
        loading.value = true;
        error.value = null;
        try {
            const newRoom = await service.createRoom(data);
            await fetchRooms(); // Refresh list
            return newRoom;
        } catch (err) {
            error.value = err.message || 'Error creating room';
            console.error('Error creating room:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Removed onMounted to avoid auto-fetching - let components control when to fetch

    return {
        rooms,
        loading,
        error,
        fetchRooms,
        getRoomById,
        getRoomsByType,
        createRoom
    };
}

