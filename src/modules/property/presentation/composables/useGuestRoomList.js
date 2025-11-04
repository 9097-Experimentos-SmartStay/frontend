// src/modules/property/presentation/composables/useGuestRoomList.js
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PropertyService } from '../../application/PropertyService.js';
import { PropertyApiRepository } from '../../infrastructure/repositories/PropertyApiRepository.js';

export function useGuestRoomList() {
    const router = useRouter();

    const propertyRepo = new PropertyApiRepository();
    const propertySvc = new PropertyService(propertyRepo);

    // --- Estado de Datos ---
    const allRooms = ref([]);
    const allProperties = ref([]); // Para el <Dropdown> de hoteles
    const loading = ref(true);

    // --- ESTADO DE FILTROS (Tus nuevas "armas") ---
    const searchTerm = ref(''); // Filtro de texto
    const selectedHotel = ref(null); // Filtro de Dropdown (por ID de hotel)
    const priceRange = ref([0, 500]); // Filtro de Slider [min, max]

    // --- Carga de Datos (Visión Espacial) ---
    async function loadAllData() {
        loading.value = true;
        try {
            const [roomsData, propertiesData] = await Promise.all([
                propertySvc.getRoomList(null),
                propertySvc.getPropertyList()
            ]);

            allRooms.value = roomsData || [];
            allProperties.value = propertiesData || [];

            // Opcional: Ajustar el max del slider al precio más caro
            if (roomsData.length > 0) {
                const maxPrice = Math.max(...roomsData.map(r => r.price));
                priceRange.value = [0, maxPrice > 500 ? maxPrice : 500];
            }

        } catch (err) {
            console.error("Error loading rooms or properties:", err);
        } finally {
            loading.value = false;
        }
    }

    // --- "Fórmula" de Filtro Mejorada ---
    const filteredAndEnrichedRooms = computed(() => {

        // Preparamos los filtros
        const query = searchTerm.value.toLowerCase().trim();
        const minPrice = priceRange.value[0];
        const maxPrice = priceRange.value[1];
        const hotelId = selectedHotel.value; // Esto será un ID (ej: 101)

        // 1. Empezamos con las "oportunidades de gol" (disponibles)
        let rooms = allRooms.value.filter(r => r.status === 'available');

        // 2. Aplicar filtro de Hotel (si existe)
        if (hotelId) {
            rooms = rooms.filter(r => r.propertyId === hotelId);
        }

        // 3. Aplicar filtro de Precio
        rooms = rooms.filter(r => r.price >= minPrice && r.price <= maxPrice);

        // 4. Aplicar filtro de Texto
        if (query) {
            rooms = rooms.filter(
                r => (r.type && r.type.toLowerCase().includes(query)) ||
                    (r.name && r.name.toLowerCase().includes(query))
            );
        }

        // 5. "Pase Químico" (Enriquecer)
        return rooms.map(room => {
            const property = allProperties.value.find(p => p.id === room.propertyId);
            return {
                ...room,
                propertyName: property?.name || 'Hotel Desconocido',
                propertyLocation: property?.location || 'Sin ubicación'
            };
        });
    });

    // --- Acciones ---
    function goToProperty(propertyId) {
        router.push({ name: 'guest-property-details', params: { id: propertyId } });
    }

    function goBackToDashboard() {
        router.push({ name: 'guest-dashboard' });
    }

    onMounted(loadAllData);

    return {
        loading,

        // --- Devolvemos los filtros ---
        searchTerm,
        selectedHotel,
        priceRange,

        // --- Devolvemos los datos ---
        allProperties, // Necesario para el <Dropdown>
        filteredAndEnrichedRooms,

        // --- Devolvemos las acciones ---
        goToProperty,
        goBackToDashboard,
        refreshRooms: loadAllData
    };
}