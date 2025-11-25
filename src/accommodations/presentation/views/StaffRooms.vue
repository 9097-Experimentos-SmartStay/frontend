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
        <h3 class="text-3xl font-bold text-primary">Gestión de Habitaciones</h3>
      </div>
    </div>

    <div v-if="loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem"></i>
      <p class="text-gray-500 mt-2">Cargando habitaciones...</p>
    </div>

    <pv-data-table
      v-else-if="rooms.length"
      :value="rooms"
      responsive-layout="scroll"
      tableStyle="min-width: 50rem"
      class="shadow-sm rounded-lg overflow-hidden"
    >
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="text-lg font-semibold text-primary">Todas las habitaciones</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="fetchRooms" />
        </div>
      </template>

      <pv-column field="id" header="ID" sortable />
      <pv-column field="roomTypeId" header="Tipo ID" sortable />
      <pv-column field="roomTypeName" header="Tipo de Habitación" />
      <pv-column field="description" header="Descripción" />
      <pv-column field="amenities" header="Amenidades">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <pv-tag
              v-for="amenity in data.amenities"
              :key="amenity"
              :value="amenity"
              severity="info"
              class="text-xs"
            />
          </div>
        </template>
      </pv-column>
      <pv-column header="Acciones">
        <template #body="{ data }">
          <pv-button
            icon="pi pi-eye"
            label="Ver Reservas"
            class="p-button-info p-button-sm"
            @click="viewBookings(data.id)"
          />
        </template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
      <i class="pi pi-home text-gray-400" style="font-size: 3rem"></i>
      <p class="text-gray-500 mt-4">No hay habitaciones registradas</p>
    </div>
  </div>
</template>

<script setup>
import { useRooms } from '../composables/useRooms.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const { rooms, loading, error, fetchRooms } = useRooms();

const goBack = () => {
  router.push({ name: 'staff-dashboard' });
};

const viewBookings = (roomId) => {
  // Redirigir a la vista de reservas filtrada por habitación
  router.push({ name: 'staff-bookings', query: { roomId } });
};
</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
</style>

