<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">Dashboard Staff</h1>
    <p class="text-gray-600">Vista de dashboard para staff - Por implementar</p>
    <pv-button label="Ver Habitaciones" @click="goToRooms" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goToRooms() {
  router.push({ name: 'staff-rooms' });
}
</script>

