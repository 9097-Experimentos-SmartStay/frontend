<template>
  <div class="p-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver al Dashboard"
            class="p-button-outlined p-button-sm"
            @click="goBack"
        />
        <h1 class="text-xl font-semibold text-gray-800">
          🧹 Gestión de Habitaciones del Staff
        </h1>
      </div>

      <pv-button
          icon="pi pi-refresh"
          label="Actualizar"
          class="p-button-sm"
          @click="refreshRooms"
      />
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-xl p-4 text-center shadow-sm border border-gray-100 bg-white"
      >
        <p class="text-sm text-gray-500">{{ stat.label }}</p>
        <p :class="['text-lg font-bold', stat.color]">{{ stat.count }}</p>
      </div>
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
        <!-- Imagen -->
        <div class="relative w-20rem h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
              v-if="room.image_url"
              :src="room.image_url"
              :alt="`Habitación ${room.number}`"
              class="object-cover w-full h-full transition-transform duration-200 hover:scale-105"
          />
          <div v-else class="text-gray-400 italic text-sm">Sin imagen</div>

          <!-- Estado -->
          <span
              class="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-md text-white"
              :class="getBadgeColor(room.status)"
          >
            {{ traducirEstado(room.status) }}
          </span>
        </div>

        <!-- Contenido -->
        <div class="p-3">
          <h2 class="font-bold text-base text-gray-800 mb-1 truncate">
            Habitación #{{ room.number }}
          </h2>

          <p class="text-xs text-gray-600 mb-1">
            Tipo: {{ room.type }}
          </p>

          <p class="text-sm font-semibold text-blue-600 mb-3">
            Precio: ${{ room.price }}
          </p>

          <!-- Botón de acción principal -->
          <pv-button
              :icon="getButtonIcon(room.status)"
              :label="getButtonLabel(room.status)"
              :class="getButtonClass(room.status)"
              class="p-button-sm w-full mb-2"
              @click="handleStateChange(room)"
          />

          <!-- Botón de mantenimiento adicional -->
          <pv-button
              v-if="room.status !== 'maintenance'"
              icon="pi pi-wrench"
              label="Marcar en Mantenimiento"
              class="p-button-help p-button-sm w-full"
              @click="markAsMaintenance(room)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import PvButton from "primevue/button";
import { useRoomData } from "../composables/useRoomData.js";

const router = useRouter();
const {
  rooms,
  loading,
  loadRooms,
  updateRoomStatus,
} = useRoomData();

onMounted(() => loadRooms());

async function refreshRooms() {
  await loadRooms();
}

function goBack() {
  router.push({ name: "staff-dashboard" });
}

/* === Colores de etiquetas === */
function getBadgeColor(status) {
  const map = {
    available: "bg-green-600",
    cleaning: "bg-yellow-500",
    occupied: "bg-blue-600",
    maintenance: "bg-red-600",
  };
  return map[status?.toLowerCase()] || "bg-gray-500";
}

/* === Traducción de estados === */
function traducirEstado(status) {
  const map = {
    available: "Disponible",
    cleaning: "En Limpieza",
    occupied: "Ocupada",
    maintenance: "Mantenimiento",
  };
  return map[status] || status;
}

/* === Botones dinámicos === */
function getButtonLabel(status) {
  switch (status) {
    case "available":
      return "🏨 Marcar como Ocupada";
    case "occupied":
      return "🧽 Marcar para Limpieza";
    case "cleaning":
      return "✅ Marcar como Lista";
    case "maintenance":
      return "🔧 Finalizar Mantenimiento";
    default:
      return "Sin acción";
  }
}

function getButtonIcon(status) {
  switch (status) {
    case "available":
      return "pi pi-user";
    case "occupied":
      return "pi pi-broom";
    case "cleaning":
      return "pi pi-check";
    case "maintenance":
      return "pi pi-wrench";
    default:
      return "pi pi-info-circle";
  }
}

function getButtonClass(status) {
  switch (status) {
    case "available":
      return "p-button-info";
    case "occupied":
      return "p-button-warning";
    case "cleaning":
      return "p-button-success";
    case "maintenance":
      return "p-button-secondary";
    default:
      return "p-button-outlined";
  }
}

/* === Lógica de cambio de estado === */
async function handleStateChange(room) {
  let newStatus = room.status;

  switch (room.status) {
    case "available":
      newStatus = "occupied";
      break;
    case "occupied":
      newStatus = "cleaning";
      break;
    case "cleaning":
      newStatus = "available";
      break;
    case "maintenance":
      newStatus = "available";
      break;
  }

  await updateRoomStatus(room.id, newStatus);
  await loadRooms();
}

/* === Marcar en mantenimiento === */
async function markAsMaintenance(room) {
  await updateRoomStatus(room.id, "maintenance");
  await loadRooms();
}

/* === Estadísticas === */
const stats = computed(() => {
  const available = rooms.value.filter((r) => r.status === "available").length;
  const cleaning = rooms.value.filter((r) => r.status === "cleaning").length;
  const occupied = rooms.value.filter((r) => r.status === "occupied").length;
  const maintenance = rooms.value.filter((r) => r.status === "maintenance").length;

  return [
    { label: "Disponibles", count: available, color: "text-green-600" },
    { label: "En Limpieza", count: cleaning, color: "text-yellow-600" },
    { label: "Ocupadas", count: occupied, color: "text-blue-600" },
    { label: "Mantenimiento", count: maintenance, color: "text-red-600" },
  ];
});
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
  height: 7rem;
  object-fit: cover;
}
</style>
