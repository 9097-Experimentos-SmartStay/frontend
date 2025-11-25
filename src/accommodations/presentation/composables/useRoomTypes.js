// src/bounded-contexts/accommodations/presentation/composables/useRoomTypes.js
import { ref, onMounted } from 'vue';
import { RoomTypeService } from '../../application/room-type-service.js';

export function useRoomTypes() {
    const roomTypes = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const service = new RoomTypeService();

    const fetchRoomTypes = async () => {
        loading.value = true;
        error.value = null;
        try {
            roomTypes.value = await service.getAllRoomTypes();
        } catch (err) {
            error.value = err.message || 'Error fetching room types';
            console.error('Error fetching room types:', err);
        } finally {
            loading.value = false;
        }
    };

    const getRoomTypeById = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            return await service.getRoomTypeById(id);
        } catch (err) {
            error.value = err.message || 'Error fetching room type';
            console.error('Error fetching room type:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const createRoomType = async (data) => {
        loading.value = true;
        error.value = null;
        try {
            const newRoomType = await service.createRoomType(data);
            await fetchRoomTypes(); // Refresh list
            return newRoomType;
        } catch (err) {
            error.value = err.message || 'Error creating room type';
            console.error('Error creating room type:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    onMounted(() => {
        fetchRoomTypes();
    });

    return {
        roomTypes,
        loading,
        error,
        fetchRoomTypes,
        getRoomTypeById,
        createRoomType
    };
}

