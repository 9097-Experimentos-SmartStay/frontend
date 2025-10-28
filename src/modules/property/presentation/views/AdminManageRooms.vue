<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Gestión de Habitaciones</h3>
    <ul>
      <li v-for="room in rooms" :key="room.id">
        Habitación {{ room.number }} — {{ room.status }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { adminService } from "../../../admin/application/admin_service.js";
const rooms = adminService.getRoomList();
</script>
