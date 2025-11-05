import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PropertyService } from '../../../property/application/PropertyService.js';
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js';

export function useGuestPropertyDetails() {
    const router = useRouter();
    const route = useRoute();

    const propertyRepo = new PropertyApiRepository();
    const propertySvc = new PropertyService(propertyRepo);

    // --- Estado ---
    const property = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const rooms = ref([]);
    const roomsLoading = ref(true);

    // ... (la función loadPropertyDetails se mantiene igual) ...
    async function loadPropertyDetails() {
        loading.value = true;
        roomsLoading.value = true;
        error.value = null;

        try {
            const propertyId = route.params.id;
            if (!propertyId) throw new Error("No se encontró ID de propiedad");

            const [propertyResult, roomsResult] = await Promise.allSettled([
                propertySvc.getPropertyById(propertyId),
                propertySvc.getRoomList(propertyId)
            ]);

            if (propertyResult.status === 'fulfilled') {
                property.value = propertyResult.value;
            } else {
                throw new Error(`Fallo al cargar propiedad: ${propertyResult.reason}`);
            }

            if (roomsResult.status === 'fulfilled') {
                rooms.value = roomsResult.value;
            } else {
                console.error("No se pudieron cargar las habitaciones:", roomsResult.reason);
            }

        } catch (err) {
            console.error("Error loading property details:", err);
            error.value = err.message;
        } finally {
            loading.value = false;
            roomsLoading.value = false;
        }
    }


    const availableRooms = computed(() => {
        const currentPropertyId = Number(route.params.id);
        return rooms.value
            .filter(room => room.propertyId === currentPropertyId)
            .filter(room => room.status === 'available');
    });

    // --- Acciones ---
    function goBackToList() {
        router.push({ name: 'guest-properties' });
    }

    // --- ¡CAMBIO AQUÍ! ---
    // Descomentamos la navegación para que se active el "Tiro a Gol"
    function bookRoom(room) {
        const propertyId = property.value.id;
        const roomId = room.id;

        console.log(`Iniciando flujo de reserva para Propiedad ${propertyId}, Habitación ${roomId}`);

        // ¡Navegamos a la nueva vista de formulario!
        router.push({
            name: 'guest-create-booking', // Este nombre debe coincidir con el de las rutas
            params: { propertyId: propertyId, roomId: roomId }
        });
    }

    onMounted(loadPropertyDetails);

    return {
        property,
        loading,
        error,
        rooms,
        roomsLoading,
        availableRooms,
        goBackToList,
        bookRoom, // ¡Ahora esta función navega!
        loadPropertyDetails
    };
}