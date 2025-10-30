// src/modules/dashboard/presentation/views/StaffDashboard.vue
<template>
  <div class="staff-dashboard">
    <pv-toast position="bottom-right" />
    <pv-menu ref="menu" :model="menuItems" :popup="true" />

    <pv-toolbar class="staff-toolbar">
      <template #start>
        <pv-button icon="pi pi-bars" class="p-button-secondary mr-2" @click="toggleMenu" />
        <h1 class="toolbar-title">{{ t('staffDashboard.title') }}</h1>
      </template>
      <template #end>
        <LanguageSwitcher class="mr-2" />
        <pv-button :label="t('dashboard.logoutButton')" icon="pi pi-sign-out" class="p-button-danger" @click="logout" />
      </template>
    </pv-toolbar>

    <div class="p-4 dashboard-content">

      <div class="grid mb-4">
        <div class="col-12 md:col-8">
          <h2 class="text-2xl font-bold">{{ t('staffDashboard.welcome', { name: staffProfile.name }) }}</h2>
          <p class="text-lg text-color-secondary">{{ staffProfile.position || 'Staff' }} | {{ t('staffDashboard.shift') }}: {{ staffProfile.shift || 'N/A' }}</p>
        </div>
        <div class="col-12 md:col-4">
          <pv-card class="time-clock-card">
            <template #title>{{ t('staffDashboard.timeClock') }}</template>
            <template #content>
              <div class="flex flex-wrap gap-2 justify-center">
                <pv-button :label="t('staffDashboard.clockIn')" icon="pi pi-play" class="p-button-success" />
                <pv-button :label="t('staffDashboard.startBreak')" icon="pi pi-pause" class="p-button-warning" />
                <pv-button :label="t('staffDashboard.clockOut')" icon="pi pi-stop" class="p-button-danger" />
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <div class="grid mb-4">
        <div class="col-12">
          <pv-card>
            <template #title>{{ t('staffDashboard.performanceStats') }}</template>
            <template #content>
              <div class="grid text-center">
                <div class="col-6 md:col-3">
                  <div class="stat-value">{{ stats.daily }}</div>
                  <div class="stat-label">{{ t('staffDashboard.tasksToday') }}</div>
                </div>
                <div class="col-6 md:col-3">
                  <div class="stat-value">{{ stats.weekly }}</div>
                  <div class="stat-label">{{ t('staffDashboard.tasksThisWeek') }}</div>
                </div>
                <div class="col-6 md:col-3">
                  <div class="stat-value">{{ stats.monthly }}</div>
                  <div class="stat-label">{{ t('staffDashboard.tasksThisMonth') }}</div>
                </div>
                <div class="col-6 md:col-3">
                  <div class="stat-value">{{ stats.yearly }}</div>
                  <div class="stat-label">{{ t('staffDashboard.tasksThisYear') }}</div>
                </div>
              </div>
              <div class="mt-4">
                <pv-chart type="bar" :data="stats.chartData" :options="chartOptions" />
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <div class="grid">
        <div class="col-12 md:col-7">
          <pv-card>
            <template #title>
              <div class="flex justify-between items-center">
                <span>{{ t('staffDashboard.pendingTasks') }}</span>
                <pv-button :label="t('staffDashboard.viewAllTasks')" class="p-button-text" @click="goToTasks" />
              </div>
            </template>
            <template #content>
              <pv-data-table :value="pendingTasks" :loading="loading" class="p-datatable-sm" :rows="5" responsiveLayout="scroll">
                <pv-column field="description" :header="t('staffDashboard.taskDescription')"></pv-column>
                <pv-column field="roomId" :header="t('staffDashboard.taskRoom')"></pv-column>
                <pv-column field="status" :header="t('staffDashboard.taskStatus')">
                  <template #body="slotProps">
                    <pv-tag :severity="getStatusSeverity(slotProps.data.status)" :value="t(`taskStatus.${slotProps.data.status.toLowerCase()}`)" />
                  </template>
                </pv-column>
                <pv-column :header="t('common.actions')">
                  <template #body="slotProps">
                    <pv-button icon="pi pi-check" class="p-button-rounded p-button-success p-button-text" @click="completeTask(slotProps.data)" v-tooltip.top="t('common.complete')" />
                  </template>
                </pv-column>
                <template #empty>{{ t('staffDashboard.noPendingTasks') }}</template>
                <template #loading>{{ t('adminManageUsers.loadingMessage') }}</template>
              </pv-data-table>
            </template>
          </pv-card>
        </div>

        <div class="col-12 md:col-5">
          <pv-card>
            <template #title>
              <div class="flex justify-between items-center">
                <span>{{ t('staffDashboard.assignedRooms') }}</span>
                <pv-button :label="t('staffDashboard.viewAllRooms')" class="p-button-text" @click="goToRooms" />
              </div>
            </template>
            <template #content>
              <pv-data-table :value="assignedRooms" :loading="loading" class="p-datatable-sm" :rows="5" responsiveLayout="scroll">
                <pv-column field="number" :header="t('staffDashboard.roomNumber')"></pv-column>
                <pv-column field="status" :header="t('staffDashboard.taskStatus')">
                  <template #body="slotProps">
                    <pv-tag :severity="getStatusSeverity(slotProps.data.status)" :value="t(`roomStatus.${slotProps.data.status.toLowerCase()}`)" />
                  </template>
                </pv-column>
                <template #empty>{{ t('staffDashboard.noAssignedRooms') }}</template>
                <template #loading>{{ t('adminManageUsers.loadingMessage') }}</template>
              </pv-data-table>
            </template>
          </pv-card>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from "primevue/usetoast";

// --- Componentes PrimeVue ---
import PvToolbar from 'primevue/toolbar';
import PvButton from 'primevue/button';
import PvMenu from 'primevue/menu';
import PvCard from 'primevue/card';
import PvDataTable from 'primevue/datatable';
import PvColumn from 'primevue/column';
import PvTag from 'primevue/tag';
import PvChart from 'primevue/chart';
import PvToast from 'primevue/toast';
import Tooltip from 'primevue/tooltip'; // Importa la directiva
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue'; // Ajusta ruta

// --- Servicios ---
// Nota: UserService (para perfil) y PropertyService (para tareas/habitaciones)
import { UserService } from '../../../auth/application/UserService.js';
import { UserAPIRepository } from '../../../auth/infrastructure/repositories/user_api_repository.js';
import { ProfileApiRepository } from '../../../auth/infrastructure/repositories/ProfileApiRepository.js';
import { PropertyService } from '../../../property/application/PropertyService.js';
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js';

// --- Inicializa hooks ---
const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const menu = ref(); // Ref para el menú popup

// --- Instancia Servicios ---
const userRepository = new UserAPIRepository();
const profileRepository = new ProfileApiRepository();
const propertyRepository = new PropertyApiRepository();
const userService = new UserService(userRepository, profileRepository, propertyRepository);
const propertyService = new PropertyService(propertyRepository);

// --- Estado del Componente ---
const staffId = ref(null);
const staffProfile = ref({ name: 'Staff', position: '', shift: '' });
const allTasks = ref([]);
const stats = ref({ daily: 0, weekly: 0, monthly: 0, yearly: 0, chartData: {} });
const assignedRooms = ref([]);
const loading = ref(true);

// --- Opciones de Gráfico ---
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  plugins: { legend: { display: false } }
});

// --- Menú de Navegación ---
const menuItems = ref([
  { label: t('menu.profile'), icon: 'pi pi-user', command: () => goToProfile() },
  { label: t('menu.tasks'), icon: 'pi pi-check-square', command: () => goToTasks() },
  { label: t('menu.assignedRooms'), icon: 'pi pi-key', command: () => goToRooms() },
  // Puedes añadir más opciones aquí (ej: 'Notificaciones', 'Soporte')
]);

// --- Carga Inicial ---
onMounted(async () => {
  loading.value = true;
  try {
    // 1. Obtener ID del staff logueado
    const storedUser = localStorage.getItem('user');
    if (!storedUser) throw new Error("User not found in localStorage.");
    staffId.value = JSON.parse(storedUser).id;

    // 2. Cargar Perfil, Tareas, Estadísticas y Habitaciones en paralelo
    const [profileDetails, tasksData, statsData, roomsData] = await Promise.all([
      userService.getStaffDetailsList().then(list => list.find(s => s.id === staffId.value)), // Busca el perfil específico
      propertyService.getTaskList(staffId.value),
      propertyService.getTaskStats(staffId.value),
      propertyService.getAssignedRoomsForStaff() // Ya filtra por estado
    ]);

    // 3. Asignar valores
    if (profileDetails) staffProfile.value = profileDetails;
    allTasks.value = tasksData || [];
    stats.value = statsData || { daily: 0, weekly: 0, monthly: 0, yearly: 0, chartData: {} };
    assignedRooms.value = roomsData || [];

    console.log("Staff Dashboard: Data loaded.", { profile: staffProfile.value, tasks: allTasks.value, stats: stats.value, rooms: assignedRooms.value });

  } catch (error) {
    console.error("Error loading staff dashboard:", error);
    toast.add({ severity: 'error', summary: t('errors.fetchError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  } finally {
    loading.value = false;
  }
});

// --- Propiedades Computadas ---
const pendingTasks = computed(() => {
  // Muestra solo las primeras 5 tareas pendientes
  return allTasks.value
      .filter(t => t.status.toLowerCase() === 'pendiente' || t.status.toLowerCase() === 'en proceso')
      .slice(0, 5);
});

// --- Métodos ---
function toggleMenu(event) {
  menu.value.toggle(event);
}

function logout() {
  localStorage.clear();
  router.push({ name: 'login' });
}

// --- Navegación ---
function goToProfile() {
  console.log("Navigate to Profile...");
  // router.push({ name: 'staff-profile' }); // Necesitas crear esta ruta
}
function goToTasks() {
  console.log("Navigate to Tasks...");
  router.push({ name: 'staff-task-list' }); // Ruta que ya existe en property.router.js
}
function goToRooms() {
  console.log("Navigate to Rooms...");
  router.push({ name: 'staff-room-cleaning' }); // Ruta que ya existe en property.router.js
}

// --- Acciones ---
async function completeTask(task) {
  console.log("Completing task:", task.id);
  try {
    await propertyService.markTaskAsCompleted(task.id);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffDashboard.taskCompleted'), life: 3000 });

    // Recargar datos para actualizar todo
    await onMounted(); // Vuelve a ejecutar la lógica de carga
  } catch (error) {
    console.error("Error completing task:", error);
    toast.add({ severity: 'error', summary: t('errors.taskError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

// --- Helpers Visuales ---
function getStatusSeverity(status) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'available': return 'success';
    case 'occupied': return 'danger';
    case 'cleaning': return 'info';
    case 'maintenance': return 'warning';
    case 'pendiente': return 'warning';
    case 'en proceso': return 'info';
    case 'completada': return 'success';
    case 'por limpiar': return 'info';
    case 'revisión pendiente': return 'warning';
    default: return 'secondary';
  }
}

// Registra la directiva Tooltip
const vTooltip = Tooltip;
</script>

<style scoped>
.staff-toolbar {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}
.toolbar-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}
.time-clock-card .p-card-body {
  padding: 1rem;
}
.time-clock-card .p-card-content {
  padding: 0.5rem 0 0 0;
}
.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
}
.stat-label {
  font-size: 1rem;
  color: var(--text-color-secondary);
}
.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}
/* Asegura que el gráfico tenga altura */
:deep(.p-chart) {
  height: 250px;
}
</style>