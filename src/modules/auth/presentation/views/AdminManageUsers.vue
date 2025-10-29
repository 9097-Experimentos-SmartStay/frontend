<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <pv-button
          icon="pi pi-arrow-left"
          class="p-button-secondary p-button-outlined"
          @click="goBackToDashboard"
          v-tooltip.top="t('common.back')"
      />

      <h2 class="text-2xl font-bold text-center flex-grow">
        <i class="pi pi-users mr-2"></i> {{ t('dashboard.manageStaffButton') }}
      </h2>

      <LanguageSwitcher />
    </div>

    <pv-data-table :value="staffList" :loading="loading" responsiveLayout="scroll" class="p-datatable-sm">
      <template #header>
        <div class="flex justify-between items-center">
          <span>{{ t('adminManageUsers.registeredStaff') }}</span>
          <div>
            <pv-button
                icon="pi pi-user-plus"
                :label="t('common.add')"
                class="p-button-success mr-2"
                @click="navigateToAddUser"
                v-tooltip.top="t('adminManageUsers.addUserTooltip')"
            />
            <pv-button
                icon="pi pi-refresh"
                class="p-button-text"
                @click="loadStaffDetails"
                :loading="loading"
                v-tooltip.top="t('common.refresh')"
            />
          </div>
        </div>
      </template>

      <pv-column field="name" :header="t('adminManageUsers.headerName')" sortable></pv-column>
      <pv-column field="position" :header="t('adminManageUsers.headerPosition')" sortable></pv-column>
      <pv-column field="shiftStatus" :header="t('adminManageUsers.headerShiftStatus')" sortable>
        <template #body="slotProps">
          <pv-tag :severity="getShiftSeverity(slotProps.data.shiftStatus)" :value="t(`staffStatus.${slotProps.data.shiftStatus}`)"></pv-tag>
        </template>
      </pv-column>
      <pv-column field="currentStatus" :header="t('adminManageUsers.headerCurrentStatus')" sortable>
        <template #body="slotProps">
          <pv-tag :severity="getStatusSeverity(slotProps.data.currentStatus)" :value="t(`staffStatus.${slotProps.data.currentStatus}`)"></pv-tag>
        </template>
      </pv-column>
      <pv-column field="currentTaskDescription" :header="t('adminManageUsers.headerCurrentTask')"></pv-column>
      <pv-column field="roomsCleanedToday" :header="t('adminManageUsers.headerCleanedToday')" sortable>
        <template #body="slotProps">
          <pv-badge :value="slotProps.data.roomsCleanedToday" severity="info"></pv-badge>
        </template>
      </pv-column>
      <pv-column field="shift" :header="t('adminManageUsers.headerShift')"></pv-column>
      <pv-column :header="t('adminManageUsers.headerActions')">
        <template #body="slotProps">
          <pv-button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info mr-2" @click="editStaff(slotProps.data.id)" v-tooltip.top="t('common.edit')"/>
          <pv-button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="confirmDeleteStaff(slotProps.data.id, slotProps.data.name)" v-tooltip.top="t('common.delete')"/>
        </template>
      </pv-column>

      <template #loading>
        {{ t('adminManageUsers.loadingMessage') }}
      </template>
      <template #empty>
        {{ t('adminManageUsers.emptyMessage') }}
      </template>
    </pv-data-table>

    <pv-confirm-dialog></pv-confirm-dialog>
    <pv-toast position="bottom-right" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'; // Ya estaba importado
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

// --- Importa componentes PrimeVue ---
import PvDataTable from 'primevue/datatable';
import PvColumn from 'primevue/column';
import PvButton from 'primevue/button';
import PvTag from 'primevue/tag';
import PvBadge from 'primevue/badge';
import PvConfirmDialog from 'primevue/confirmdialog';
import PvToast from 'primevue/toast';
import Tooltip from 'primevue/tooltip';

// --- Importa Servicios y Repositorios ---
import { UserService } from '../../application/UserService.js';
import { UserAPIRepository } from '../../infrastructure/repositories/user_api_repository.js';
import { ProfileApiRepository } from '../../infrastructure/repositories/ProfileApiRepository.js';
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js';
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue";

// --- Inicializa hooks ---
const { t } = useI18n();
const router = useRouter(); // Ya estaba inicializado
const confirm = useConfirm();
const toast = useToast();

// --- Instancia Servicios ---

const userRepository = new UserAPIRepository();
const profileRepository = new ProfileApiRepository();
const propertyRepository = new PropertyApiRepository();
const userService = new UserService(userRepository, profileRepository, propertyRepository);

// --- Estado del Componente ---
const staffList = ref([]);
const loading = ref(true);

// --- Carga Inicial ---
onMounted(() => {
  loadStaffDetails();
});

// --- Métodos ---
async function loadStaffDetails() {
  loading.value = true;
  console.log('AdminManageUsers: Fetching staff details...');
  try {
    staffList.value = await userService.getStaffDetailsList();
    console.log('AdminManageUsers: Staff details fetched:', staffList.value);
  } catch (error) {
    console.error("Error fetching staff details:", error);
    toast.add({ severity: 'error', summary: t('errors.fetchError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  } finally {
    loading.value = false;
  }
}

// --- Helpers para Tags ---
function getStatusSeverity(status) {
  // ... (igual que antes)
  switch (status) {
    case 'available': return 'success';
    case 'busy': return 'warning';
    case 'on_break': return 'info';
    case 'off_duty': return 'secondary';
    default: return 'secondary';
  }
}
function getShiftSeverity(shiftStatusKey) { // *** CORREGIDO ***
  return shiftStatusKey === 'onShift' ? 'success' : 'secondary'; // Compara con la clave correcta
}

// --- Acciones ---
function editStaff(staffId) {
  console.log('Navegando a editar staff con ID:', staffId);
  router.push({
    name: 'admin-edit-user', // Asegúrate que este nombre de ruta existe
    params: { userId: staffId }
  });
}

// Confirmación antes de borrar
function confirmDeleteStaff(staffId, staffName) {
  confirm.require({
    message: t('adminManageUsers.confirmDeleteMessage', { name: staffName }), // Nueva clave i18n con placeholder
    header: t('adminManageUsers.confirmDeleteHeader'),                       // Nueva clave i18n
    icon: 'pi pi-info-circle',
    rejectLabel: t('common.cancel'),    // Nueva clave i18n
    acceptLabel: t('common.delete'),    // Nueva clave i18n
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await deleteStaff(staffId); // Llama a la función de borrado si se acepta
    },
    reject: () => {
      toast.add({ severity: 'info', summary: t('common.cancelled'), detail: t('adminManageUsers.deleteCancelled'), life: 3000 }); // Nuevas claves i18n
    }
  });
}

// Lógica de borrado (requiere método en UserService)
async function deleteStaff(staffId) { // Ahora es async
  console.log('Eliminar staff con ID:', staffId);
  try {
    // *** LLAMA AL MÉTODO DEL SERVICIO ***
    await userService.deleteUserAndProfile(staffId);
    // *** FIN LLAMADA ***

    toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageUsers.deleteSuccess'), life: 3000 });
    await loadStaffDetails(); // Recarga la lista
  } catch (error) {
    console.error("Error deleting staff:", error);
    toast.add({ severity: 'error', summary: t('errors.deleteError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

function navigateToAddUser() {
  console.log('Navigating to Add User page...');
  router.push({ name: 'admin-add-user' }); // Usa el nombre de la ruta definida
}

function goBackToDashboard() {
  console.log('Navigating back to admin dashboard...');
  router.push({ name: 'admin-dashboard' }); // Usa el nombre de la ruta del dashboard de admin
}

// Registra la directiva Tooltip (necesaria si no es global)
const vTooltip = Tooltip;

</script>

<style scoped>
/* ... (mismos estilos que antes) ... */
.p-datatable-sm :deep(.p-datatable-thead > tr > th) {
  padding: 0.5rem 0.5rem;
}
.p-datatable-sm :deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.5rem;
}
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mr-2 { margin-right: 0.5rem; }
</style>