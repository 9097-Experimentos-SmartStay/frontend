// src/modules/property/presentation/composables/useGuestPropertyDetails.js
import { ref, onMounted, computed } from 'vue'; // <-- Añade 'computed'
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
    const loading = ref(true); // Loading para la propiedad
    const error = ref(null);

    // --- NUEVO ESTADO PARA HABITACIONES ---
    const rooms = ref([]);
    const roomsLoading = ref(true); // Loading separado para las habitaciones

    // --- Lógica de Carga ---
    async function loadPropertyDetails() {
        loading.value = true;
        roomsLoading.value = true;
        error.value = null;

        try {
            const propertyId = route.params.id;
            if (!propertyId) throw new Error("No se encontró ID de propiedad");

            // Optimizamos: Cargamos propiedad y habitaciones al mismo tiempo
            // Usamos Promise.allSettled para que si uno falla, el otro no
            const [propertyResult, roomsResult] = await Promise.allSettled([
                propertySvc.getPropertyById(propertyId),
                propertySvc.getRoomList(propertyId) // <-- Usamos nuestra "arma" nueva
            ]);

            // Chequeamos resultado de Propiedad
            if (propertyResult.status === 'fulfilled') {
                property.value = propertyResult.value;
            } else {
                throw new Error(`Fallo al cargar propiedad: ${propertyResult.reason}`);
            }

            // Chequeamos resultado de Habitaciones
            if (roomsResult.status === 'fulfilled') {
                rooms.value = roomsResult.value;
            } else {
                // No es un error fatal, solo lo mostramos en consola
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

    // --- NUEVA "ARMA" (Computed) ---
    // Filtramos las habitaciones para mostrar solo las disponibles
    // ¡El "Ego" del Guest solo ve oportunidades de gol (disponibles)!
    const availableRooms = computed(() => {
        return rooms.value.filter(room => room.status === 'available');
    });

    // --- Acciones ---
    function goBackToList() {
        router.push({ name: 'guest-properties' });
    }

    // --- MODIFICADO: El "Tiro a Gol" ahora es por HABITACIÓN ---
    function bookRoom(room) {
        const propertyId = property.value.id;
        const roomId = room.id;

        console.log(`Iniciando flujo de reserva para Propiedad ${propertyId}, Habitación ${roomId}`);
        // Navegarías a la página de confirmación de reserva
        // router.push({
        //   name: 'guest-create-booking',
        //   params: { propertyId: propertyId, roomId: roomId }
        // });
    }

    onMounted(loadPropertyDetails);

    return {
        property,
        loading,
        error,

        // --- NUEVOS RETORNOS ---
        rooms,
        roomsLoading,
        availableRooms,

        goBackToList,
        bookRoom, // <-- Renombrado de bookNow
        loadPropertyDetails
    };
}