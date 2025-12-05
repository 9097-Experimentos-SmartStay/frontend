<template>
  <div class="surface-ground min-h-screen flex flex-column">
    <pv-toast position="bottom-right" />

    <pv-toolbar class="sticky top-0 z-5 shadow-1 border-none px-4 md:px-6 py-3 adaptive-toolbar">
      <template #start>
        <div class="flex align-items-center gap-2 cursor-pointer" @click="goBack">
          <i class="pi pi-building text-primary text-3xl"></i>
          <span class="text-xl font-bold app-title">SmartStay</span>
        </div>
      </template>
      <template #end>
        <div class="flex gap-2">
          <pv-button label="Volver al Dashboard" icon="pi pi-arrow-left" class="p-button-text" @click="goBack" />
        </div>
      </template>
    </pv-toolbar>

    <div class="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto">

      <div class="flex flex-column md:flex-row justify-content-between align-items-center mb-5 gap-3">
        <div>
          <h1 class="text-3xl font-bold text-900 m-0">Habitaciones Disponibles</h1>
          <p class="text-600 mt-2">Encuentra el espacio perfecto para tu estancia.</p>
        </div>

        <div class="w-full md:w-auto flex gap-3">
          <span class="p-float-label w-full md:w-20rem">
            <pv-select
                id="roomType"
                v-model="selectedRoomType"
                :options="roomStore.roomTypes"
                optionLabel="name"
                optionValue="id"
                showClear
                class="w-full"
            />
            <label for="roomType">Filtrar por Tipo</label>
          </span>
        </div>
      </div>

      <div v-if="roomStore.loading" class="flex flex-column align-items-center justify-content-center h-20rem">
        <pv-progress-spinner />
        <p class="mt-3 text-gray-500">Buscando las mejores habitaciones...</p>
      </div>

      <div v-else-if="roomStore.error" class="surface-card p-6 border-round-xl text-center shadow-1 border-red-100 border-1">
        <div class="bg-red-50 border-circle w-4rem h-4rem flex align-items-center justify-content-center mx-auto mb-3">
          <i class="pi pi-exclamation-triangle text-2xl text-red-500"></i>
        </div>
        <h3 class="text-900 font-medium m-0 mb-2">No pudimos cargar las habitaciones</h3>
        <p class="text-600 mb-4">{{ roomStore.error.message || 'Hubo un problema de conexión.' }}</p>
        <pv-button label="Reintentar" icon="pi pi-refresh" class="p-button-outlined p-button-danger" @click="fetchData" />
      </div>

      <div v-else-if="filteredRooms.length === 0" class="surface-card p-6 border-round-xl text-center shadow-1">
        <i class="pi pi-home text-5xl text-gray-300 mb-3"></i>
        <h3>No hay habitaciones disponibles con este filtro.</h3>
        <pv-button label="Ver todas" class="p-button-outlined mt-3" @click="selectedRoomType = null" />
      </div>

      <div v-else class="grid">
        <div v-for="room in filteredRooms" :key="room.id" class="col-12 md:col-6 lg:col-4">
          <div class="surface-card shadow-2 border-round-xl h-full flex flex-column overflow-hidden hover:shadow-4 transition-duration-300 cursor-pointer group" @click="viewRoomDetails(room.id)">

            <div class="relative h-15rem w-full bg-gray-100 flex align-items-center justify-content-center overflow-hidden">
              <i class="pi pi-image text-5xl text-gray-300"></i>
              <div class="absolute top-0 left-0 m-3">
                <pv-tag :value="room.roomTypeName || 'Estándar'" severity="info" rounded></pv-tag>
              </div>
            </div>

            <div class="p-4 flex-1 flex flex-column justify-content-between">
              <div>
                <div class="flex justify-content-between align-items-start mb-2">
                  <h2 class="text-xl font-bold text-900 m-0 group-hover:text-primary transition-colors transition-duration-200">
                    {{ room.roomTypeName || `Habitación ${room.id}` }}
                  </h2>
                </div>

                <p class="text-600 line-height-3 text-sm mb-4 h-3rem overflow-hidden text-overflow-ellipsis">
                  {{ room.description || 'Sin descripción disponible.' }}
                </p>

                <div class="flex gap-2 flex-wrap mb-4">
                  <span v-for="amenity in (room.amenities || []).slice(0, 3)" :key="amenity" class="surface-100 text-600 border-round px-2 py-1 text-xs font-medium uppercase">
                    {{ amenity }}
                  </span>
                  <span v-if="room.amenities?.length > 3" class="text-xs text-500 flex align-items-center">
                    +{{ room.amenities.length - 3 }}
                  </span>
                </div>
              </div>

              <div class="border-top-1 border-200 pt-3 flex justify-content-end align-items-center mt-auto">
                <pv-button label="Ver Detalles" icon="pi pi-arrow-right" iconPos="right" class="p-button-text p-button-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRoomStore } from '../../application/room.store.js';

const router = useRouter();
const roomStore = useRoomStore();
const selectedRoomType = ref(null);

const fetchData = async () => {
  await Promise.all([
    roomStore.fetchAllRooms(),
    roomStore.fetchAllRoomTypes()
  ]);
};

onMounted(() => {
  fetchData();
});

const filteredRooms = computed(() => {
  if (!selectedRoomType.value) {
    return roomStore.rooms;
  }
  return roomStore.rooms.filter(room => String(room.roomTypeId) === String(selectedRoomType.value));
});

const goBack = () => {
  router.push({ name: 'guest-dashboard' });
};

const viewRoomDetails = (roomId) => {
  router.push({ name: 'guest-room-detail', params: { roomId } });
};
</script>

<style scoped>
.adaptive-toolbar {
  background-color: #ffffff;
  transition: background-color 0.3s;
}
.app-title { color: #111827; }

@media (prefers-color-scheme: dark) {
  .adaptive-toolbar {
    background-color: #18181b;
    border-bottom: 1px solid #27272a;
  }
  .app-title { color: #f4f4f5; }
}

.transition-duration-300 { transition-duration: 300ms; }
.hover\:shadow-4:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
</style>