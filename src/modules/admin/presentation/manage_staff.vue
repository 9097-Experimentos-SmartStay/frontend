<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Gestión del Staff</h3>
    <ul>
      <li v-for="member in staff" :key="member.id">
        {{ member.name }} — {{ member.role }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { adminService } from "../application/admin_service.js";
const staff = adminService.getStaffList();
</script>
