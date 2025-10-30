<template>
  <div class="task-list-page">
    <pv-toast />
    <pv-confirm-dialog />

    <pv-toolbar class="mb-4">
      <template #start>
        <pv-button :label="t('common.back')" icon="pi pi-arrow-left" class="p-button-secondary mr-2" @click="goBack" />
        <pv-button :label="t('tasks.newTask')" icon="pi pi-plus" class="p-button-success" @click="openNew" />
      </template>
      <template #end>
        <LanguageSwitcher />
      </template>
    </pv-toolbar>

    <div class="card">
      <pv-data-table
          :value="tasks"
          :loading="loading"
          paginator
          :rows="10"
          responsiveLayout="scroll"
          :globalFilterFields="['description', 'roomId', 'status']"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl m-0">{{ t('tasks.title') }}</h3>
          </div>
        </template>

        <pv-column field="description" :header="t('staffDashboard.taskDescription')" sortable style="min-width: 16rem"></pv-column>
        <pv-column field="roomId" :header="t('staffDashboard.taskRoom')" sortable></pv-column>

        <pv-column field="status" :header="t('staffDashboard.taskStatus')" sortable>
          <template #body="slotProps">
            <pv-tag :severity="getStatusSeverity(slotProps.data.status)" :value="t(`taskStatus.${slotProps.data.status.toLowerCase()}`)" />
          </template>
        </pv-column>

        <pv-column field="createdAt" :header="t('tasks.created')" sortable>
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.createdAt) }}
          </template>
        </pv-column>

        <pv-column :header="t('common.actions')" :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <pv-button
                v-if="slotProps.data.status !== 'Completada'"
                icon="pi pi-check"
                class="p-button-rounded p-button-success p-button-text mr-2"
                @click="completeTask(slotProps.data)"
                v-tooltip.top="t('common.complete')"
            />
            <pv-button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-warning p-button-text mr-2"
                @click="editTask(slotProps.data)"
                v-tooltip.top="t('common.edit')"
            />
            <pv-button
                icon="pi pi-trash"
                class="p-button-rounded p-button-danger p-button-text"
                @click="confirmDeleteTask(slotProps.data)"
                v-tooltip.top="t('common.delete')"
            />
          </template>
        </pv-column>

        <template #empty>{{ t('tasks.noTasksFound') }}</template>
        <template #loading>{{ t('common.loading') }}</template>
      </pv-data-table>
    </div>

    <pv-dialog v-model:visible="taskDialog" :style="{width: '450px'}" :header="t('tasks.taskDetails')" :modal="true" class="p-fluid">

      <div class="field">
        <label for="description">{{ t('staffDashboard.taskDescription') }}</label>
        <pv-textarea id="description" v-model.trim="task.description" required="true" rows="3" :class="{'p-invalid': submitted && !task.description}" />
        <small class="p-error" v-if="submitted && !task.description">{{ t('errors.descriptionRequired') }}</small>
      </div>

      <div class="field">
        <label for="roomId">{{ t('staffDashboard.taskRoom') }}</label>
        <pv-input-text id="roomId" v-model.trim="task.roomId" />
      </div>

      <div class="field">
        <label for="status">{{ t('staffDashboard.taskStatus') }}</label>
        <pv-select id="status" v-model="task.status" :options="statusOptions" optionLabel="label" optionValue="value" :placeholder="t('tasks.selectStatus')" />
      </div>

      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
        <pv-button :label="t('common.save')" icon="pi pi-check" @click="saveTask" />
      </template>
    </pv-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

// Componentes
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue';
import PvToolbar from 'primevue/toolbar';
import PvDataTable from 'primevue/datatable';
import PvColumn from 'primevue/column';
import PvButton from 'primevue/button';
import PvTag from 'primevue/tag';
import PvDialog from 'primevue/dialog';
import PvInputText from 'primevue/inputtext';
import PvTextarea from 'primevue/textarea';
import PvSelect from 'primevue/select';
import PvToast from 'primevue/toast';
import PvConfirmDialog from 'primevue/confirmdialog';
import Tooltip from 'primevue/tooltip';

// Servicios
import { PropertyService } from '../../application/PropertyService.js';
import { PropertyApiRepository } from '../../infrastructure/repositories/PropertyApiRepository.js';

// Hooks
const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

// Directiva Tooltip
const vTooltip = Tooltip;

// Servicios
const propertyRepository = new PropertyApiRepository();
const propertyService = new PropertyService(propertyRepository);

// Estado
const tasks = ref([]);
const loading = ref(true);
const staffId = ref(null);
const taskDialog = ref(false);
const task = ref({});
const submitted = ref(false);

// Opciones computadas para que se actualicen al cambiar de idioma
const statusOptions = computed(() => [
  { label: t('taskStatus.pendiente'), value: 'Pendiente' },
  { label: t('taskStatus.en_proceso'), value: 'En proceso' },
  { label: t('taskStatus.completada'), value: 'Completada' }
]);

// Carga Inicial
onMounted(async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) throw new Error("User not found in localStorage.");
    staffId.value = JSON.parse(storedUser).id;
    await loadTasks();
  } catch (error) {
    console.error("Error on mount:", error);
    toast.add({ severity: 'error', summary: t('errors.authError'), detail: t('errors.userNotFound'), life: 3000 });
  }
});

async function loadTasks() {
  loading.value = true;
  try {
    tasks.value = await propertyService.getTaskList(staffId.value);
    console.log('StaffTaskList: Tasks fetched:', tasks.value);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    toast.add({ severity: 'error', summary: t('errors.fetchError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  } finally {
    loading.value = false;
  }
}

// Navegación
function goBack() {
  router.push('/staff'); // Asumiendo que /staff es tu dashboard
}

// Lógica del CRUD
function openNew() {
  task.value = { status: 'Pendiente' };
  submitted.value = false;
  taskDialog.value = true;
}

function hideDialog() {
  taskDialog.value = false;
  submitted.value = false;
}

function editTask(taskData) {
  task.value = { ...taskData };
  taskDialog.value = true;
}

async function saveTask() {
  submitted.value = true;
  if (!task.value.description || !task.value.description.trim()) {
    toast.add({ severity: 'warn', summary: t('common.warning'), detail: t('errors.descriptionRequired'), life: 3000 });
    return;
  }

  try {
    loading.value = true;

    if (task.value.id) {
      // Actualización
      // Usamos updateTaskDetails para lógica de negocio genérica (no solo completar)
      await propertyService.updateTaskDetails(task.value.id, task.value);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('tasks.taskUpdated'), life: 3000 });
    }
    else {
      // Creación
      const newTaskData = {
        ...task.value,
        assignedTo: staffId.value,
        createdAt: new Date().toISOString() // Asegura fecha de creación
      };
      await propertyService.createTask(newTaskData);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('tasks.taskCreated'), life: 3000 });
    }

    await loadTasks();
    hideDialog();

  } catch (error) {
    console.error("Error saving task:", error);
    toast.add({ severity: 'error', summary: t('errors.saveError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  } finally {
    loading.value = false;
  }
}

// --- Acciones de Fila ---
async function completeTask(taskData) {
  try {
    // Llama al servicio específico para 'completar'
    await propertyService.markTaskAsCompleted(taskData.id);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffDashboard.taskCompleted'), life: 3000 });
    await loadTasks();
  } catch (error) {
    console.error("Error completing task:", error);
    toast.add({ severity: 'error', summary: t('errors.taskError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

function confirmDeleteTask(taskData) {
  task.value = taskData;
  confirm.require({
    // CLAVE NUEVA
    message: t('tasks.deleteConfirmMsg', { description: taskData.description }),
    // CLAVE REUTILIZADA
    header: t('adminManageUsers.confirmDeleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: async () => {
      await deleteTask();
    },
    reject: () => {
      // CLAVE REUTILIZADA
      toast.add({ severity: 'info', summary: t('common.cancelled'), detail: t('adminManageUsers.deleteCancelled'), life: 3000 });
    }
  });
}

async function deleteTask() {
  try {
    loading.value = true;
    await propertyService.removeTask(task.value.id);
    // CLAVE NUEVA
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('tasks.taskDeleted'), life: 3000 });
    await loadTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
    toast.add({ severity: 'error', summary: t('errors.deleteError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  } finally {
    loading.value = false;
  }
}

// --- Helpers Visuales ---
function getStatusSeverity(status) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completada': return 'success';
    case 'en proceso': return 'info';
    case 'pendiente': return 'warning';
    default: return 'secondary';
  }
}

function formatDateTime(dateString) {
  if (!dateString) return t('common.notAvailable');
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString;
  }
}
</script>

<style scoped>
.task-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
.p-button.p-button-warning.p-button-text {
  color: var(--orange-500);
}
.p-button.p-button-success.p-button-text {
  color: var(--green-500);
}
</style>