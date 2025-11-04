// src/modules/guest/composables/useGuestProperties.js
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PropertyService } from '../../../property/application/PropertyService.js'; // Ajusta la ruta
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js'; // Ajusta la ruta

export function useGuestProperties() {
    const router = useRouter();

    // --- Instanciación de Servicios ---
    // Reutilizamos el servicio que ya existe
    const propertyRepo = new PropertyApiRepository();
    const propertySvc = new PropertyService(propertyRepo);

    // --- Estado ---
    const allProperties = ref([]);
    const loading = ref(true);
    const searchTerm = ref(''); // Para un futuro filtro de búsqueda

    // --- Carga de Datos ---
    async function loadProperties() {
        loading.value = true;
        try {
            // Usamos el método que trae la lista de propiedades/hoteles
            // Si quieres cuartos, usa getRoomList() y filtra por 'available'
            // Si quieres hoteles, usa getPropertyList()

            // Basado en tu GuestDashboard, parece que muestras "Properties" (Hoteles)
            allProperties.value = await propertySvc.getPropertyList();
        } catch (err) {
            console.error("Error loading properties:", err);
        } finally {
            loading.value = false;
        }
    }

    // --- Datos Computados ---
    // Aquí puedes filtrar las propiedades si es necesario
    const filteredProperties = computed(() => {
        if (!searchTerm.value) {
            return allProperties.value;
        }
        const query = searchTerm.value.toLowerCase();
        return allProperties.value.filter(
            p => p.name.toLowerCase().includes(query) ||
                p.location.toLowerCase().includes(query)
        );
    });

    // --- Acciones del Guest ---
    function goToPropertyDetails(propertyId) {
        // El "gol": navegar al detalle para reservar
        router.push({ name: 'guest-property-details', params: { id: propertyId } });
    }

    function goBackToDashboard() {
        router.push({ name: 'guest-dashboard' });
    }

    // --- Ciclo de Vida ---
    onMounted(loadProperties);

    return {
        loading,
        searchTerm,
        filteredProperties,
        goToPropertyDetails,
        goBackToDashboard,
        refreshProperties: loadProperties // Para un botón de refrescar
    };
}