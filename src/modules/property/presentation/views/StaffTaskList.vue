<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Tareas Asignadas</h3>
    <div v-if="loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando tareas...</p>
    </div>
    <ul v-else-if="tasks.length">
      <li v-for="task in tasks" :key="task.id" class="mb-2 p-2 border rounded flex justify-between items-center">
        <span>{{ task.description }} — <span :class="statusClass(task.status)">{{ task.status }}</span></span>
        <pv-button
            v-if="task.status !== 'Completada'"
            label="Completar"
            icon="pi pi-check-circle"
            class="p-button-sm p-button-success"
            @click="complete(task.id)"
            :loading="completingTask === task.id"
        />
      </li>
    </ul>
    <p v-else class="text-center p-4">No tienes tareas asignadas.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// Importa desde property
import { PropertyService } from '../../application/PropertyService.js';
import { PropertyApiRepository } from '../../infrastructure/repositories/PropertyApiRepository.js';

const propertyRepository = new PropertyApiRepository();
const propertyService = new PropertyService(propertyRepository);

const tasks = ref([]);
const loading = ref(true);
const completingTask = ref(null);

onMounted(async () => {
  await loadTasks();
});

async function loadTasks() {
  loading.value = true;
  console.log('StaffTaskList: Fetching tasks...');
  try {
    tasks.value = await propertyService.getTaskList();
    console.log('StaffTaskList: Tasks fetched:', tasks.value);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  } finally {
    loading.value = false;
  }
}

async function complete(taskId) {
  completingTask.value = taskId;
  console.log('Completando tarea ID:', taskId);
  try {
    const updatedTask = await propertyService.markTaskAsCompleted(taskId);
    const index = tasks.value.findIndex(t => t.id === taskId);
    if (index !== -1 && updatedTask) {
      tasks.value[index] = updatedTask;
    } else {
      await loadTasks();
    }
  } catch (error) {
    alert(`Error al completar la tarea: ${error.message || 'Intente de nuevo'}`);
  } finally {
    completingTask.value = null;
  }
}

// Function to determine status class and help with styling
function statusClass(status) {
  if (status === 'Completada') return 'text-green-600 font-semibold';
  if (status === 'En proceso') return 'text-blue-600';
  return 'text-orange-600';
}
</script>

<style scoped>
.text-green-600 { color: #16a34a; }
.text-blue-600 { color: #2563eb; }
.text-orange-600 { color: #ea580c; }
.font-semibold { font-weight: 600; }
</style>