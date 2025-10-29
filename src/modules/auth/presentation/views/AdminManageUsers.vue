<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4"> <i class="pi pi-users mr-2"></i> Gestión de Personal </h2>

    <pv-data-table :value="staffList" :loading="loading" responsiveLayout="scroll" class="p-datatable-sm">
      <template #header>
        <div class="flex justify-between items-center">
          <span>Personal Registrado</span>
          <pv-button icon="pi pi-refresh" class="p-button-text" @click="loadStaffDetails" :loading="loading"/>
        </div>
      </template>

      <pv-column field="name" header="Nombre" sortable></pv-column>
      <pv-column field="position" header="Puesto" sortable></pv-column>
      <pv-column field="shiftStatus" header="Estado Turno" sortable>
        <template #body="slotProps">
          <pv-tag :severity="getShiftSeverity(slotProps.data.shiftStatus)" :value="t(`staffStatus.${slotProps.data.shiftStatus.replace(' ', '')}`)"></pv-tag>
        </template>
      </pv-column>
      <pv-column field="currentStatus" header="Estado Actual" sortable>
        <template #body="slotProps">
          <pv-tag :severity="getStatusSeverity(slotProps.data.currentStatus)" :value="t(`staffStatus.${slotProps.data.currentStatus}`)"></pv-tag>
        </template>
      </pv-column>
      <pv-column field="currentTaskDescription" header="Tarea Actual"></pv-column>
      <pv-column field="roomsCleanedToday" header="Cuartos Limp. Hoy" sortable>
        <template #body="slotProps">
          <pv-badge :value="slotProps.data.roomsCleanedToday" severity="info"></pv-badge>
        </template>
      </pv-column>
      <pv-column field="shift" header="Turno"></pv-column>
      <pv-column header="Acciones">
        <template #body="slotProps">
          <pv-button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info mr-2" @click="editStaff(slotProps.data.id)" v-tooltip.top="'Editar'"/>
          <pv-button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="deleteStaff(slotProps.data.id)" v-tooltip.top="'Eliminar'"/>
        </template>
      </pv-column>

      <template #loading>
        Cargando datos del personal...
      </template>
      <template #empty>
        No se encontró personal.
      </template>
    </pv-data-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
// Importa componentes PrimeVue
import PvDataTable from 'primevue/datatable';
import PvColumn from 'primevue/column';
import PvButton from 'primevue/button';
import PvTag from 'primevue/tag';
import PvBadge from 'primevue/badge';
import Tooltip from 'primevue/tooltip'; // Directiva para tooltips

// Importa Servicios y Repositorios necesarios
import { UserService } from '../../application/UserService.js';
import { UserAPIRepository } from '../../infrastructure/repositories/user_api_repository.js';
import { ProfileApiRepository } from '../../infrastructure/repositories/ProfileApiRepository.js'; // Repo de Profile
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js'; // Repo de Property (para tareas)

// Instancia Servicios (Mejor con Inyección de Dependencias)
const userRepository = new UserAPIRepository();
const profileRepository = new ProfileApiRepository();
const propertyRepository = new PropertyApiRepository(); // Necesario para UserService
const userService = new UserService(userRepository, profileRepository, propertyRepository);

const { t } = useI18n(); // Para traducir tags de estado
const staffList = ref([]);
const loading = ref(true);

onMounted(() => {
  loadStaffDetails();
});

async function loadStaffDetails() {
  loading.value = true;
  console.log('AdminManageUsers: Fetching staff details...');
  try {
    // Llama al método que combina y calcula todo
    staffList.value = await userService.getStaffDetailsList();
    console.log('AdminManageUsers: Staff details fetched:', staffList.value);
  } catch (error) {
    console.error("Error fetching staff details:", error);
    // Mostrar error al usuario
  } finally {
    loading.value = false;
  }
}

// --- Helpers para severidad de Tags ---
function getStatusSeverity(status) {
  switch (status) {
    case 'available': return 'success';
    case 'busy': return 'warning';
    case 'on_break': return 'info';
    case 'off_duty': return 'secondary'; // O 'danger' si prefieres
    default: return 'secondary';
  }
}
function getShiftSeverity(shiftStatus) {
  return shiftStatus === 'En Turno' ? 'success' : 'secondary';
}

// --- Placeholder para Acciones ---
function editStaff(staffId) {
  console.log('Editar staff con ID:', staffId);
  // Navegar a ruta de edición o abrir modal
}
function deleteStaff(staffId) {
  console.log('Eliminar staff con ID:', staffId);
  // Mostrar confirmación y llamar al servicio para eliminar
}

// Registra la directiva Tooltip
const vTooltip = Tooltip;

</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.p-datatable-sm :deep(.p-datatable-thead > tr > th) {
  padding: 0.5rem 0.5rem; /* Reduce padding cabecera */
}
.p-datatable-sm :deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.5rem; /* Reduce padding celdas */
}
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mr-2 { margin-right: 0.5rem; }
</style>