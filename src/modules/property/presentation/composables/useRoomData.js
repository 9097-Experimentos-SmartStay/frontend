// src/modules/property/presentation/composables/useRoomData.js
import { ref, onMounted } from 'vue';
import { RoomRepository } from '../../infrastructure/repositories/room-repository.js';
import { RoomService } from '../../application/room-service.js';

export function useRoomData() {
    const rooms = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const repository = new RoomRepository();
    const service = new RoomService(repository);

    const loadRooms = async () => {
        loading.value = true;
        try {
            rooms.value = await service.getRoomList();
            console.log("📦 Rooms loaded:", rooms.value.length);
        } catch (err) {
            error.value = err.message;
            console.error("Error loading rooms:", err);
        } finally {
            loading.value = false;
        }
    };

    const markRoomAsCleaning = async (roomId) => {
        try {
            await service.markAsCleaning(roomId);
            await loadRooms();
        } catch (err) {
            error.value = err.message;
            console.error(`Error marking room ${roomId} as cleaning:`, err);
        }
    };

    const markRoomAsAvailable = async (roomId) => {
        try {
            await service.markAsAvailable(roomId);
            await loadRooms();
        } catch (err) {
            error.value = err.message;
            console.error(`Error marking room ${roomId} as available:`, err);
        }
    };

    async function updateRoomStatus(id, newStatus) {
        try {
            await service.updateRoom(id, { status: newStatus });
            await loadRooms();
        } catch (err) {
            error.value = err.message;
            console.error(`Error updating room ${id} status:`, err);
        }
    }

    onMounted(loadRooms);

    return {
        rooms,
        loading,
        error,
        loadRooms,
        markRoomAsCleaning,
        markRoomAsAvailable,
        updateRoomStatus
    };
}
