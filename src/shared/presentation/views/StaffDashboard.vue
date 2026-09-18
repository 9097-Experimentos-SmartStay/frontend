<template>
  <div class="surface-ground min-h-screen flex flex-column">
    <pv-toast position="bottom-right" />

    <pv-toolbar class="sticky top-0 z-5 border-none px-4 md:px-6 py-3 adaptive-toolbar shadow-2">
      <template #start>
        <div class="flex align-items-center gap-3">
          <div class="bg-primary text-white border-round p-2 flex align-items-center justify-content-center">
            <i class="pi pi-shield text-xl"></i>
          </div>
          <div class="flex flex-column">
            <span class="font-bold text-xl text-color">SmartStay Admin</span>
            <span class="text-xs text-color-secondary">Panel de Control</span>
          </div>
        </div>

        <div class="w-1px h-2rem bg-300 mx-4 hidden lg:block"></div>

        <div class="hidden lg:flex gap-2">
          <pv-button label="Dashboard" icon="pi pi-chart-bar" class="p-button-text" :class="{ 'bg-primary-50 text-primary': activeTab === 'dashboard' }" @click="activeTab = 'dashboard'" />
          <pv-button label="Hoteles" icon="pi pi-building" class="p-button-text text-color-secondary" @click="navigateTo('staff-hotels')" />
          <pv-button label="Habitaciones" icon="pi pi-key" class="p-button-text text-color-secondary" @click="navigateTo('staff-rooms')" />
          <pv-button label="Reservas" icon="pi pi-calendar" class="p-button-text text-color-secondary" @click="navigateTo('staff-bookings')" />
        </div>
      </template>

      <template #end>
        <div class="flex align-items-center gap-2">
          <pv-button
              label="Crear Nuevo"
              icon="pi pi-plus"
              class="p-button-outlined p-button-success mr-2"
              @click="toggleCreateMenu"
              aria-haspopup="true"
              aria-controls="create_menu"
          />
          <pv-menu ref="createMenu" id="create_menu" :model="createMenuItems" :popup="true" />

          <pv-button icon="pi pi-bell" class="p-button-rounded p-button-text text-color-secondary" v-tooltip.bottom="'Notificaciones'" />

          <div class="flex align-items-center gap-2 cursor-pointer surface-hover p-2 border-round transition-duration-200" @click="toggleUserMenu" aria-haspopup="true" aria-controls="user_menu">
            <pv-avatar label="AD" shape="circle" class="bg-primary text-white" />
            <span class="font-medium text-color hidden md:block">{{ currentUser?.username || 'Admin' }}</span>
            <i class="pi pi-angle-down text-color-secondary hidden md:block"></i>
          </div>
          <pv-menu ref="userMenu" id="user_menu" :model="userMenuItems" :popup="true" />
        </div>
      </template>
    </pv-toolbar>

    <div class="flex-1 p-4 md:p-6 w-full max-w-8xl mx-auto">

      <div class="grid mb-4">
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card shadow-2 p-3 border-round-xl border-bottom-3 border-blue-500 h-full hover:shadow-4 transition-duration-300">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">Ingresos Totales</span>
                <div class="text-900 text-color font-bold text-2xl">
                  <span v-if="analyticsStore.loading">...</span>
                  <span v-else>${{ analyticsStore.metrics?.formattedRevenue || '0.00' }}</span>
                </div>
              </div>
              <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
                <i class="pi pi-dollar text-blue-500 text-xl"></i>
              </div>
            </div>
            <span class="text-green-500 font-medium">Actualizado </span>
            <span class="text-500 text-sm">hace un momento</span>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card shadow-2 p-3 border-round-xl border-bottom-3 border-orange-500 h-full hover:shadow-4 transition-duration-300">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">Tasa de Ocupación</span>
                <div class="text-900 text-color font-bold text-2xl">
                  <span v-if="analyticsStore.loading">...</span>
                  <span v-else>{{ analyticsStore.metrics?.occupancyRate || 0 }}%</span>
                </div>
              </div>
              <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
                <i class="pi pi-chart-pie text-orange-500 text-xl"></i>
              </div>
            </div>
            <span class="text-500 text-sm">{{ analyticsStore.metrics?.totalBookings || 0 }} reservas activas</span>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card shadow-2 p-3 border-round-xl border-bottom-3 border-red-500 h-full hover:shadow-4 transition-duration-300">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">Cancelaciones</span>
                <div class="text-900 text-color font-bold text-2xl">
                  <span v-if="analyticsStore.loading">...</span>
                  <span v-else>{{ analyticsStore.metrics?.cancelledBookings || 0 }}</span>
                </div>
              </div>
              <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width:2.5rem;height:2.5rem">
                <i class="pi pi-times-circle text-red-500 text-xl"></i>
              </div>
            </div>
            <span class="text-red-500 text-sm font-medium">Requiere atención</span>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card shadow-2 p-3 border-round-xl border-bottom-3 border-cyan-500 h-full hover:shadow-4 transition-duration-300">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">Tareas Pendientes</span>
                <div class="text-900 text-color font-bold text-2xl">{{ pendingTasksCount }}</div>
              </div>
              <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
                <i class="pi pi-list text-cyan-500 text-xl"></i>
              </div>
            </div>
            <span class="text-blue-500 font-medium cursor-pointer hover:underline" @click="scrollToTasks">Ver detalles</span>
          </div>
        </div>
      </div>

      <div class="grid mb-4">
        <div class="col-12 lg:col-8">
          <div class="surface-card shadow-2 border-round-xl p-4 h-full">
            <div class="flex justify-content-between align-items-center mb-4">
              <h5 class="text-xl font-bold text-color m-0">Rendimiento Financiero</h5>
              <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text p-button-plain" @click="refreshData" />
            </div>

            <div v-if="analyticsStore.loading" class="h-20rem flex align-items-center justify-content-center">
              <pv-progress-spinner />
            </div>
            <pv-chart v-else-if="revenueData" type="line" :data="revenueData" :options="lineOptions" class="h-20rem" />
          </div>
        </div>
        <div class="col-12 lg:col-4">
          <div class="surface-card shadow-2 border-round-xl p-4 h-full flex flex-column">
            <h5 class="text-xl font-bold text-color mb-4">Disponibilidad</h5>
            <div class="flex-1 flex align-items-center justify-content-center relative">
              <div v-if="analyticsStore.loading"><pv-progress-spinner /></div>
              <pv-chart v-else-if="occupancyData" type="doughnut" :data="occupancyData" :options="pieOptions" class="w-full" style="max-height: 250px;" />
              <div v-else-if="occupancyData" class="absolute text-center pointer-events-none" style="pointer-events: none;">
                <span class="text-3xl font-bold text-color">{{ analyticsStore.metrics?.occupancyRate || 0 }}%</span>
                <div class="text-sm text-500">Ocupado</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="tasks-table" class="surface-card shadow-2 border-round-xl p-4">
        <div class="flex justify-content-between align-items-center mb-4">
          <h5 class="text-xl font-bold text-color m-0">Gestión de Tareas Operativas</h5>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <pv-input-text placeholder="Buscar tarea..." class="p-inputtext-sm" />
          </span>
        </div>

        <pv-data-table :value="operationalTasks" responsiveLayout="scroll" :paginator="true" :rows="5" class="p-datatable-sm">
          <pv-column field="roomNumber" header="Habitación" sortable>
            <template #body="slotProps">
              <span class="font-bold text-color">#{{ slotProps.data.roomNumber }}</span>
            </template>
          </pv-column>
          <pv-column field="type" header="Servicio" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <i :class="getTaskIcon(slotProps.data.type)"></i>
                <span class="text-color">{{ slotProps.data.type }}</span>
              </div>
            </template>
          </pv-column>
          <pv-column field="priority" header="Prioridad" sortable>
            <template #body="slotProps">
              <pv-tag :value="slotProps.data.priority" :severity="getPrioritySeverity(slotProps.data.priority)" rounded />
            </template>
          </pv-column>
          <pv-column field="assignedTo" header="Encargado">
            <template #body="slotProps">
              <div v-if="slotProps.data.assignedTo" class="flex align-items-center gap-2">
                <pv-avatar :label="slotProps.data.assignedTo.charAt(0)" shape="circle" class="bg-primary text-white" size="small" />
                <span class="text-color text-sm">{{ slotProps.data.assignedTo }}</span>
              </div>
              <span v-else class="text-500 italic text-sm">--</span>
            </template>
          </pv-column>
          <pv-column header="Acciones" style="width: 120px">
            <template #body="slotProps">
              <div class="flex gap-2">
                <pv-button
                    v-if="!slotProps.data.assignedTo"
                    icon="pi pi-user-plus"
                    class="p-button-rounded p-button-outlined p-button-info p-button-sm"
                    v-tooltip="'Asignar'"
                    @click="assignStaff(slotProps.data)"
                />
                <pv-button
                    icon="pi pi-check"
                    class="p-button-rounded p-button-text p-button-success p-button-sm"
                    v-tooltip="'Completar'"
                    @click="completeTask(slotProps.data)"
                />
              </div>
            </template>
          </pv-column>
        </pv-data-table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import useIamStore from '@/iam/application/iam.store.js';
import { useAnalyticsStore } from '@/analytics/application/analytics.store.js';

const router = useRouter();
const toast = useToast();
const iamStore = useIamStore();
const analyticsStore = useAnalyticsStore();

const activeTab = ref('dashboard');
const createMenu = ref();
const userMenu = ref();
const currentUser = ref(null);

// --- MENU CONFIGURATION ---
const createMenuItems = ref([
  {
    label: 'Alojamiento',
    items: [
      { label: 'Nuevo Hotel', icon: 'pi pi-building', command: () => { navigateTo('staff-hotels'); } },
      { label: 'Nueva Habitación', icon: 'pi pi-key', command: () => { navigateTo('staff-rooms'); } },
      { label: 'Tipo de Habitación', icon: 'pi pi-tags', command: () => { navigateTo('staff-rooms'); } }
    ]
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Asignar Tarea', icon: 'pi pi-list', command: () => { scrollToTasks(); } },
      { label: 'Registrar Incidencia', icon: 'pi pi-exclamation-triangle', command: () => { toast.add({ severity:'info', summary:'Incidencia', detail:'Módulo de incidencias pronto.'}); } }
    ]
  }
]);

const userMenuItems = ref([
  { label: 'Mi Perfil', icon: 'pi pi-user', command: () => { /* go to profile */ } },
  { label: 'Configuración', icon: 'pi pi-cog', command: () => { /* go to settings */ } },
  { separator: true },
  { label: 'Cerrar Sesión', icon: 'pi pi-power-off', class: 'text-red-500', command: () => { logout(); } }
]);

const toggleCreateMenu = (event) => { createMenu.value.toggle(event); };
const toggleUserMenu = (event) => { userMenu.value.toggle(event); };

// --- DATA LOGIC ---
const revenueData = ref(null);
const occupancyData = ref(null);
const lineOptions = ref(null);
const pieOptions = ref(null);

const operationalTasks = ref([
  { id: 1, roomNumber: '101', type: 'Limpieza', priority: 'Alta', assignedTo: null },
  { id: 2, roomNumber: '205', type: 'Room Service', priority: 'Media', assignedTo: 'Maria G.' },
  { id: 3, roomNumber: '304', type: 'Mantenimiento (A/C)', priority: 'Crítica', assignedTo: 'Carlos T.' },
  { id: 4, roomNumber: '102', type: 'Check-out', priority: 'Alta', assignedTo: null },
  { id: 5, roomNumber: 'Lobby', type: 'Limpieza General', priority: 'Baja', assignedTo: 'Juan P.' },
]);

const pendingTasksCount = computed(() => operationalTasks.value.filter(t => !t.assignedTo).length);

const updateCharts = () => {
  if (!analyticsStore.metrics) return;

  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  // Dynamic Dates
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const allMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dynamicLabels = allMonths.slice(0, currentMonthIndex + 1);
  const historicalData = new Array(currentMonthIndex).fill(0);
  const revenueSeries = [...historicalData, analyticsStore.metrics.totalRevenue];

  revenueData.value = {
    labels: dynamicLabels,
    datasets: [
      {
        label: 'Ingresos ($)',
        data: revenueSeries,
        fill: true,
        borderColor: documentStyle.getPropertyValue('--primary-color'),
        tension: 0.4,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
          return gradient;
        }
      }
    ]
  };

  lineOptions.value = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
      y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder }, beginAtZero: true }
    }
  };

  const occupancy = analyticsStore.metrics.occupancyRate || 0;
  const vacancy = 100 - occupancy;

  occupancyData.value = {
    labels: ['Ocupado', 'Disponible'],
    datasets: [
      {
        data: [occupancy, vacancy],
        backgroundColor: [documentStyle.getPropertyValue('--green-500'), documentStyle.getPropertyValue('--surface-300')],
        hoverBackgroundColor: [documentStyle.getPropertyValue('--green-400'), documentStyle.getPropertyValue('--surface-200')],
        borderWidth: 0
      }
    ]
  };

  pieOptions.value = {
    plugins: { legend: { labels: { color: textColor }, position: 'bottom' } },
    cutout: '60%'
  };
};

// --- ACTIONS ---

const navigateTo = (routeName) => {
  router.push({ name: routeName });
};

const refreshData = async () => {
  await analyticsStore.fetchMonthlyMetrics();
  updateCharts();
  toast.add({ severity: 'success', summary: 'Sincronizado', detail: 'Datos actualizados.', life: 3000 });
};

const logout = () => {
  iamStore.signOut();
  router.push({ name: 'login' });
};

const scrollToTasks = () => {
  document.getElementById('tasks-table')?.scrollIntoView({ behavior: 'smooth' });
};

const assignStaff = (task) => {
  toast.add({ severity: 'info', summary: 'Procesando', detail: 'Asignando personal...', life: 1000 });
  setTimeout(() => {
    const index = operationalTasks.value.findIndex(t => t.id === task.id);
    if(index !== -1) operationalTasks.value[index].assignedTo = "Staff #42";
    toast.add({ severity: 'success', summary: 'Asignado', detail: 'Tarea actualizada.', life: 2000 });
  }, 800);
};

const completeTask = (task) => {
  operationalTasks.value = operationalTasks.value.filter(t => t.id !== task.id);
  toast.add({ severity: 'success', summary: 'Completado', detail: 'Tarea finalizada.', life: 2000 });
};

const createNewTask = () => {
  toast.add({ severity: 'info', summary: 'Nuevo', detail: 'Abrir modal de nueva tarea.', life: 2000 });
};

// --- HELPERS ---
const getPrioritySeverity = (p) => ({ 'Baja': 'success', 'Media': 'info', 'Alta': 'warning', 'Crítica': 'danger' }[p] || 'info');
const getTaskIcon = (t) => (t.includes('Limpieza') ? 'pi pi-trash text-blue-500' : t.includes('Mantenimiento') ? 'pi pi-cog text-orange-500' : 'pi pi-bell text-purple-500');

onMounted(async () => {
  currentUser.value = { username: localStorage.getItem('user_username') || 'Staff' };
  await analyticsStore.fetchMonthlyMetrics();
  updateCharts();
});

watch(() => analyticsStore.metrics, () => updateCharts());
</script>

<style scoped>
/* Adaptive Toolbar for Staff */
.adaptive-toolbar {
  background-color: #ffffff;
  color: #1e293b;
  transition: background-color 0.3s, border-color 0.3s;
}

@media (prefers-color-scheme: dark) {
  .adaptive-toolbar {
    background-color: #18181b; /* Zinc 900 */
    border-bottom: 1px solid #27272a;
  }
}

:deep(.p-chart) {
  position: relative;
  width: 100%;
}
</style>