// src/modules/property/presentation/composables/useGuestPropertyDetails.js
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PropertyService } from '../../../property/application/PropertyService.js';
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js';

export function useGuestPropertyDetails() {
// --- Hooks ---
const router = useRouter(); // Para navegar
const route = useRoute();   // Para LEER la URL (obtener el :id)

// --- Servicios ---
const propertyRepo = new PropertyApiRepository();
const propertySvc = new PropertyService(propertyRepo);

// --- Estado ---
const property = ref(null);
const loading = ref(true);
const error = ref(null);

// --- Lógica de Carga ---
async function loadPropertyDetails() {
loading.value = true;
error.value = null;
try {
// 1. "Leer" el ID de la URL
const propertyId = route.params.id;
if (!propertyId) throw new Error("No se encontró ID de propiedad");

// 2. Usar nuestra "arma" nueva
property.value = await propertySvc.getPropertyById(propertyId);

} catch (err) {
console.error("Error loading property details:", err);
error.value = err.message;
} finally {
loading.value = false;
}
}

// --- Acciones ---
function goBackToList() {
router.push({ name: 'guest-properties' });
}

function bookNow() {
// El "Tiro a Gol"
const propertyId = property.value.id;
console.log(`Iniciando flujo de reserva para la propiedad ${propertyId}`);
// Aquí es donde navegarías a la página de "Crear Reserva"
// router.push({ name: 'guest-create-booking', params: { propertyId: propertyId } });
}

// Cargar datos cuando el componente se monta
onMounted(loadPropertyDetails);

return {
property,
loading,
error,
goBackToList,
bookNow,
loadPropertyDetails // para un botón de refrescar
};
}