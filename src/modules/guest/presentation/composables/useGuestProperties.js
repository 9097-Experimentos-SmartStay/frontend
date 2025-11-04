// src/modules/guest/presentation/composables/useGuestProperties.js
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Importamos los servicios desde el módulo 'property'
import { PropertyService } from '../../../property/application/PropertyService.js';
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js';

export function useGuestProperties() {
    const router = useRouter();

    // Usamos los repositorios y servicios del módulo 'property'
    const propertyRepo = new PropertyApiRepository();
    const propertySvc = new PropertyService(propertyRepo);

    // --- Estado de Datos ---
    const allProperties = ref([]);
    const loading = ref(true);

    // --- Estado de Filtros ---
    const searchTerm = ref('');

    // --- Carga de Datos ---
    async function loadProperties() {
        loading.value = true;
        try {
            // Esta es el "arma" correcta: ¡trae la lista de hoteles!
            allProperties.value = await propertySvc.getPropertyList();
        } catch (err) {
            console.error("Error loading properties:", err);
        } finally {
            loading.value = false;
        }
    }

    // --- "Fórmula" de Filtro ---
    // ¡Esta es la variable que tu template estaba buscando!
    const filteredProperties = computed(() => {
        if (!searchTerm.value.trim()) {
            return allProperties.value;
        }
        const query = searchTerm.value.toLowerCase();
        return allProperties.value.filter(
            p => (p.name && p.name.toLowerCase().includes(query)) ||
                (p.location && p.location.toLowerCase().includes(query))
        );
    });

    // --- Acciones ---
    function goToPropertyDetails(propertyId) {
        // "Pase" a la página de detalles
        router.push({ name: 'guest-property-details', params: { id: propertyId } });
    }

    function goBackToDashboard() {
        router.push({ name: 'guest-dashboard' });
    }

    // Cargar datos al montar
    onMounted(loadProperties);

    // Devolvemos el "arsenal" correcto
    return {
        loading,
        searchTerm,
        filteredProperties, // <-- ¡Aquí está!
        goToPropertyDetails,
        goBackToDashboard,
        refreshProperties: loadProperties // Para el botón de refrescar
    };
}