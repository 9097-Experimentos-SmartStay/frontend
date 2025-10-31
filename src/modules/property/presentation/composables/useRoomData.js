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
        await service.markAsCleaning(roomId);
        await loadRooms();
    };

    const markRoomAsAvailable = async (roomId) => {
        await service.markAsAvailable(roomId);
        await loadRooms();
    };

    onMounted(loadRooms);

    return {
        rooms,
        loading,
        error,
        loadRooms,
        markRoomAsCleaning,
        markRoomAsAvailable
    };
}
