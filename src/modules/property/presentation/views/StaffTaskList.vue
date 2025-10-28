<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Tareas Asignadas</h3>
    <ul>
      <li v-for="task in tasks" :key="task.id">
        {{ task.description }} — {{ task.status }}
        <button class="ml-2 p-button p-component" @click="complete(task.id)">
          Completar
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { staffService } from "../../../staff/application/staff_service.js";

const tasks = staffService.getAllTasks();

const complete = (id) => {
  staffService.markTaskCompleted(id);
};
</script>
