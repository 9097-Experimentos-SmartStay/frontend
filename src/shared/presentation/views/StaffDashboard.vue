<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column">
    <pv-toast position="bottom-right" />

    <!-- Header / Toolbar -->
    <div class="flex justify-content-between align-items-center mb-5">
      <div>
        <h1 class="text-3xl font-bold text-color m-0">Panel de Administración</h1>
        <p class="text-color-secondary mt-2">Visión general del rendimiento y operaciones del hotel.</p>
      </div>
      <div class="flex gap-3">
        <pv-button label="Reporte Mensual" icon="pi pi-file-pdf" class="p-button-outlined" />
        <pv-button label="Cerrar Sesión" icon="pi pi-power-off" class="p-button-danger" @click="logout" />
      </div>
    </div>

    <!-- 1. KPI Cards (Indicadores Clave) -->
    <div class="grid mb-4">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card shadow-2 p-3 border-round-xl border-left-3 border-blue-500">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Ingresos del Mes</span>
              <div class="text-900 font-medium text-xl">$45,200</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-dollar text-blue-500 text-xl"></i>
            </div>
          </div>
          <span class="text-green-500 font-medium">+15% </span>
          <span class="text-500">respecto al mes anterior</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card shadow-2 p-3 border-round-xl border-left-3 border-orange-500">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Ocupación Actual</span>
              <div class="text-900 font-medium text-xl">85%</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-users text-orange-500 text-xl"></i>
            </div>
          </div>
          <span class="text-500">34 de 40 habitaciones ocupadas</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card shadow-2 p-3 border-round-xl border-left-3 border-cyan-500">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Tareas Pendientes</span>
              <div class="text-900 font-medium text-xl">{{ pendingTasksCount }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-list text-cyan-500 text-xl"></i>
            </div>
          </div>
          <span class="text-orange-500 font-medium">Acción Requerida</span>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card shadow-2 p-3 border-round-xl border-left-3 border-purple-500">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Satisfacción</span>
              <div class="text-900 font-medium text-xl">4.8/5.0</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-star-fill text-purple-500 text-xl"></i>
            </div>
          </div>
          <span class="text-green-500 font-medium">+20 </span>
          <span class="text-500">nuevas reseñas</span>
        </div>
      </div>
    </div>

    <!-- 2. Charts Section -->
    <div class="grid mb-4">
      <div class="col-12 lg:col-8">
        <div class="surface-card shadow-2 border-round-xl p-4 h-full">
          <h5 class="text-xl font-bold text-color mb-4">Productividad y Ganancias (Semestral)</h5>
          <pv-chart type="line" :data="revenueData" :options="lineOptions" class="h-20rem" />
        </div>
      </div>
      <div class="col-12 lg:col-4">
        <div class="surface-card shadow-2 border-round-xl p-4 h-full">
          <h5 class="text-xl font-bold text-color mb-4">Estado de Habitaciones</h5>
          <div class="flex align-items-center justify-content-center">
            <pv-chart type="doughnut" :data="occupancyData" :options="pieOptions" class="w-full" style="max-height: 250px;" />
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Operations & Task Management -->
    <div class="surface-card shadow-2 border-round-xl p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h5 class="text-xl font-bold text-color m-0">Control de Operaciones en Piso</h5>
        <pv-button icon="pi pi-plus" label="Nueva Tarea" class="p-button-sm p-button-success" @click="createNewTask" />
      </div>

      <pv-data-table :value="operationalTasks" responsiveLayout="scroll" :paginator="true" :rows="5">
        <pv-column field="roomNumber" header="Habitación" sortable></pv-column>
        <pv-column field="type" header="Tipo de Servicio" sortable>
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <i :class="getTaskIcon(slotProps.data.type)"></i>
              {{ slotProps.data.type }}
            </div>
          </template>
        </pv-column>
        <pv-column field="priority" header="Prioridad" sortable>
          <template #body="slotProps">
            <pv-tag :value="slotProps.data.priority" :severity="getPrioritySeverity(slotProps.data.priority)" />
          </template>
        </pv-column>
        <pv-column field="assignedTo" header="Asignado A">
          <template #body="slotProps">
            <pv-avatar v-if="slotProps.data.assignedTo" :label="slotProps.data.assignedTo.charAt(0)" shape="circle" class="mr-2 bg-primary text-white" />
            <span v-else class="text-gray-400 italic">Sin asignar</span>
          </template>
        </pv-column>
        <pv-column header="Acciones">
          <template #body="slotProps">
            <div class="flex gap-2">
              <pv-button
                  v-if="!slotProps.data.assignedTo"
                  icon="pi pi-user-plus"
                  class="p-button-rounded p-button-outlined p-button-info"
                  v-tooltip="'Asignar Personal'"
                  @click="assignStaff(slotProps.data)"
              />
              <pv-button
                  icon="pi pi-check"
                  class="p-button-rounded p-button-success"
                  v-tooltip="'Marcar Completado'"
                  @click="completeTask(slotProps.data)"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import useIamStore from '@/iam/application/iam.store.js';

const router = useRouter();
const toast = useToast();
const iamStore = useIamStore();

// --- MOCK DATA FOR UI DEMO ---
// En el futuro, esto vendrá de un 'TaskStore' o 'AnalyticsStore'

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

// --- CHARTS CONFIG ---
const initCharts = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  // Chart de Ganancias
  revenueData.value = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Ingresos ($)',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        fill: true,
        borderColor: documentStyle.getPropertyValue('--primary-color'),
        tension: 0.4,
        backgroundColor: 'rgba(59, 130, 246, 0.2)'
      }
    ]
  };

  lineOptions.value = {
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
      y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
    }
  };

  // Chart de Ocupación
  occupancyData.value = {
    labels: ['Ocupado', 'Disponible', 'Limpieza', 'Mantenimiento'],
    datasets: [
      {
        data: [34, 4, 1, 1],
        backgroundColor: [
          documentStyle.getPropertyValue('--green-500'),
          documentStyle.getPropertyValue('--blue-500'),
          documentStyle.getPropertyValue('--yellow-500'),
          documentStyle.getPropertyValue('--red-500')
        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue('--green-400'),
          documentStyle.getPropertyValue('--blue-400'),
          documentStyle.getPropertyValue('--yellow-400'),
          documentStyle.getPropertyValue('--red-400')
        ]
      }
    ]
  };

  pieOptions.value = {
    plugins: { legend: { labels: { color: textColor } } }
  };
};

// --- ACTIONS ---

const logout = () => {
  iamStore.signOut(router);
};

const assignStaff = (task) => {
  // Simulación de lógica de asignación
  toast.add({ severity: 'info', summary: 'Asignando...', detail: `Buscando personal disponible para la habitación ${task.roomNumber}`, life: 2000 });
  setTimeout(() => {
    task.assignedTo = "Staff #42"; // Mock update
    toast.add({ severity: 'success', summary: 'Asignado', detail: 'Personal enviado correctamente.', life: 3000 });
  }, 1000);
};

const completeTask = (task) => {
  toast.add({ severity: 'success', summary: 'Completado', detail: `Tarea en habitación ${task.roomNumber} finalizada.`, life: 3000 });
  operationalTasks.value = operationalTasks.value.filter(t => t.id !== task.id);
};

const createNewTask = () => {
  toast.add({ severity: 'info', summary: 'Nueva Tarea', detail: 'Formulario de creación pendiente de implementación.', life: 3000 });
};

// --- HELPERS ---

const getPrioritySeverity = (priority) => {
  const map = { 'Baja': 'success', 'Media': 'info', 'Alta': 'warning', 'Crítica': 'danger' };
  return map[priority] || 'info';
};

const getTaskIcon = (type) => {
  if (type.includes('Limpieza')) return 'pi pi-trash text-blue-500';
  if (type.includes('Mantenimiento')) return 'pi pi-cog text-orange-500';
  if (type.includes('Service')) return 'pi pi-bell text-purple-500';
  return 'pi pi-check-circle';
};

onMounted(() => {
  initCharts();
});
</script>

<style scoped>
/* Asegura que los gráficos se vean bien en modo oscuro */
:deep(.p-chart) {
  position: relative;
  width: 100%;
}
</style>