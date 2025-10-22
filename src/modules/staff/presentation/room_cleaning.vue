<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Habitaciones Asignadas</h3>
    <ul>
      <li v-for="room in rooms" :key="room.roomNumber">
        Habitación {{ room.roomNumber }} — {{ room.status }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { staffService } from "../application/staff_service.js";
const rooms = staffService.getAssignedRooms();
</script>
