<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <pv-button
          icon="pi pi-arrow-left"
          label="Volver"
          class="p-button-outlined p-button-sm"
          @click="goBack"
        />
        <h3 class="text-3xl font-bold text-primary">Habitaciones Disponibles</h3>
      </div>
    </div>

    <div class="mb-4">
      <div class="field">
        <label for="roomType">Filtrar por Tipo de Habitación</label>
        <pv-select
          id="roomType"
          v-model="selectedRoomType"
          :options="roomTypes"
          optionLabel="name"
          optionValue="id"
          placeholder="Todos los tipos"
          class="w-full"
          @change="filterByRoomType"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem"></i>
      <p class="text-gray-500 mt-2">Cargando habitaciones...</p>
    </div>

    <div v-else-if="error" class="text-center p-8 bg-red-50 rounded-lg">
      <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 3rem"></i>
      <p class="text-red-600 mt-4 font-semibold">Error al cargar habitaciones</p>
      <p class="text-red-500 mt-2 text-sm">{{ error }}</p>
      <pv-button 
        label="Reintentar" 
        icon="pi pi-refresh" 
        class="p-button-outlined mt-4"
        @click="fetchRooms"
      />
      <p class="text-gray-500 mt-4 text-xs">Asegúrate de que el servidor esté corriendo en http://localhost:3000</p>
    </div>

    <div v-else-if="filteredRooms.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <pv-card
        v-for="room in filteredRooms"
        :key="room.id"
        class="room-card"
      >
        <template #content>
          <h4 class="text-lg font-bold mb-2">{{ room.roomTypeName || 'Habitación' }}</h4>
          <p class="text-sm text-gray-600 mb-2">{{ room.description }}</p>
          <div class="mb-3">
            <span class="text-xs font-semibold">Amenidades:</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <pv-tag
                v-for="amenity in room.amenities"
                :key="amenity"
                :value="amenity"
                severity="info"
                class="text-xs"
              />
            </div>
          </div>
          <pv-button
            label="Reservar"
            icon="pi pi-calendar-plus"
            class="p-button-primary w-full"
            @click="bookRoom(room.id)"
          />
        </template>
      </pv-card>
    </div>

    <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
      <i class="pi pi-home text-gray-400" style="font-size: 3rem"></i>
      <p class="text-gray-500 mt-4">No hay habitaciones disponibles</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRooms } from '../composables/useRooms.js';
import { useRoomTypes } from '../composables/useRoomTypes.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const { rooms, loading, error, fetchRooms } = useRooms();
const { roomTypes, loading: loadingTypes, fetchRoomTypes, error: roomTypesError } = useRoomTypes();

const selectedRoomType = ref(null);

onMounted(async () => {
  await Promise.all([fetchRooms(), fetchRoomTypes()]);
});

const filteredRooms = computed(() => {
  if (!selectedRoomType.value) {
    return rooms.value;
  }
  return rooms.value.filter(room => String(room.roomTypeId) === String(selectedRoomType.value));
});

const filterByRoomType = () => {
  // El computed ya maneja el filtrado
};

const goBack = () => {
  router.push({ name: 'guest-dashboard' });
};

const bookRoom = (roomId) => {
  router.push({ name: 'guest-create-booking', params: { roomId } });
};
</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
.room-card {
  transition: transform 0.2s;
}
.room-card:hover {
  transform: translateY(-4px);
}
</style>

