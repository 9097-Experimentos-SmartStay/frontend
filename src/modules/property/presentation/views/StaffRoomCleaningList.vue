<template>
  <div class="p-4">
    <h1 class="text-xl font-semibold mb-4">🧹 Room Cleaning Management</h1>

    <!-- Loader -->
    <div v-if="loading" class="text-gray-500">Cargando habitaciones...</div>

    <!-- Lista de habitaciones -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="room-card bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-200"
      >
        <!-- Imagen -->
        <img
            :src="room.image_url"
            :alt="room.name || `Habitación ${room.number}`"
            class="w-full h-48 object-cover"
        />

        <!-- Contenido -->
        <div class="p-4">
          <h2 class="font-bold text-lg mb-1">
            {{ room.name || `Habitación #${room.number}` }}
          </h2>

          <p class="text-sm text-gray-600 mb-1">
            Estado: <span class="capitalize">{{ room.status || "Desconocido" }}</span>
          </p>

          <p class="text-sm text-gray-600 mb-2">
            Tipo: {{ room.type }}
          </p>

          <p class="text-sm font-semibold text-blue-600 mb-2">
            Precio: ${{ room.price }}
          </p>

          <p v-if="room.promotion" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md inline-block">
            🎁 {{ room.promotion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, nextTick } from "vue";
import { useStaffRoomData } from "../components/useStaffRoomData.js";

const { allRooms, allBookings, allProfiles, loading } = useStaffRoomData();

// Ref de habitaciones
const filteredRooms = allRooms;

onMounted(async () => {
  console.log("🏗️ Vista montada");
  await nextTick();

  console.log("🔎 [onMounted] .room-card count:", document.querySelectorAll(".room-card").length);

  watch(
      filteredRooms,
      async (newRooms) => {
        await nextTick();
        console.log("🧠 filteredRooms loaded:", newRooms.length);
        console.log("🔎 [watch(filteredRooms)] .room-card count:", document.querySelectorAll(".room-card").length);
      },
      { deep: true, immediate: true }
  );
});
</script>

<style scoped>
.room-card {
  transition: all 0.2s ease-in-out;
}
</style>
