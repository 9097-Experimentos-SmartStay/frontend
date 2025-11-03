<!-- src/modules/staff/presentation/views/StaffActivityLog.vue -->

<template>
  <div class="bg-white shadow-md rounded-lg p-4 mt-6">
    <h2 class="text-lg font-semibold mb-3">🕒 Registro de Actividad del Staff</h2>

    <div v-if="activities.length === 0" class="text-gray-500 text-sm italic">
      No hay actividades registradas aún.
    </div>

    <ul v-else class="divide-y divide-gray-200">
      <li
          v-for="(activity, index) in activities"
          :key="index"
          class="py-2 text-sm text-gray-700"
      >
        <span class="font-medium text-blue-600">{{ activity.staffName }}</span>
        {{ activity.action }}
        la habitación
        <span class="font-semibold text-gray-800">#{{ activity.roomNumber }}</span>.
        <span class="text-gray-400 text-xs ml-2">
          ({{ activity.timestamp.toLocaleTimeString() }})
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { staffActivityStore } from "../../application/staff-activity.store.js";

const { activities } = staffActivityStore;
</script>

