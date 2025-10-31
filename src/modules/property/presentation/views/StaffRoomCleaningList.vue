<template>
  <div class="p-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver al Dashboard"
            class="p-button-outlined p-button-sm"
            @click="goBack"
        />
        <h1 class="text-xl font-semibold text-gray-800">
          🧹 Room Cleaning Management
        </h1>
      </div>

      <pv-button
          icon="pi pi-refresh"
          label="Actualizar"
          class="p-button-sm"
          @click="refreshRooms"
      />
    </div>

    <!-- Loader -->
    <div v-if="loading" class="text-gray-500 text-center py-8">
      Cargando habitaciones...
    </div>

    <!-- Lista de habitaciones -->
    <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
    >
      <div
          v-for="room in rooms"
          :key="room.id"
          class="room-card bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
      >
        <!-- Imagen - if you want to change the size of the image, change de h-16rem -->
        <div
            class="relative w-full h-16rem bg-gray-100 flex items-center justify-center overflow-hidden"
        >
          <img
              v-if="room.image_url"
              :src="room.image_url"
              :alt="room.name || `Habitación ${room.number}`"
              class="object-cover w-full h-full transition-transform duration-200 hover:scale-105"
          />
          <div v-else class="text-gray-400 italic text-sm">Sin imagen</div>

          <!-- Etiqueta de estado -->
          <span
              class="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-md text-white"
              :class="getBadgeColor(room.status)"
          >
            {{ room.status }}
          </span>
        </div>

        <!-- Contenido -->
        <div class="p-3">
          <h2 class="font-bold text-base text-gray-800 mb-1 truncate">
            {{ room.name || `Habitación #${room.number}` }}
          </h2>

          <p class="text-xs text-gray-600 mb-1">
            Tipo: {{ room.type }}
          </p>

          <p class="text-sm font-semibold text-blue-600 mb-2">
            Precio: ${{ room.price }}
          </p>

          <p
              v-if="room.promotion"
              class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md inline-block"
          >
            🎁 {{ room.promotion }}
          </p>

          <!-- Botón de acción -->
          <div class="mt-2">
            <pv-button
                v-if="room.status === 'por limpiar'"
                icon="pi pi-check"
                label="Marcar como Limpia"
                class="p-button-success p-button-sm w-full"
                @click="markAsClean(room)"
            />

            <pv-button
                v-else-if="room.status === 'disponible'"
                icon="pi pi-broom"
                label="Marcar como Sucia"
                class="p-button-warning p-button-sm w-full"
                @click="markAsDirty(room)"
            />

            <pv-button
                v-else
                icon="pi pi-info-circle"
                label="Ver Detalles"
                class="p-button-outlined p-button-sm w-full"
                @click="viewDetails(room)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import PvButton from "primevue/button";
import { useRoomData } from "../composables/useRoomData.js";

const router = useRouter();
const { rooms, loading, loadRooms, markRoomAsAvailable, markRoomAsCleaning } = useRoomData();

onMounted(() => {
  loadRooms();
});

async function refreshRooms() {
  await loadRooms();
}

function goBack() {
  router.push({ name: "staff-dashboard" });
}

function getBadgeColor(status) {
  const map = {
    disponible: "bg-green-600",
    "por limpiar": "bg-yellow-500",
    mantenimiento: "bg-red-600",
    ocupado: "bg-blue-600",
  };
  return map[status?.toLowerCase()] || "bg-gray-500";
}

async function markAsClean(room) {
  await markRoomAsAvailable(room.id);
}

async function markAsDirty(room) {
  await markRoomAsCleaning(room.id);
}

function viewDetails(room) {
  router.push({ name: "room-details", params: { id: room.id } });
}
</script>

<style scoped>
.room-card {
  transition: all 0.25s ease-in-out;
}
.room-card:hover {
  transform: translateY(-3px);
}
.room-card img {
  width: 100%;
  height: 10rem; /* altura reducida */
  object-fit: cover;
  border-bottom: 1px solid #f2f2f2;
}
</style>