<template>
  <div class="p-6 max-w-5xl mx-auto">

    <div class="mb-6">
      <pv-button
          icon="pi pi-arrow-left"
          label="Volver a la lista"
          class="p-button-text p-button-sm"
          @click="goBackToList"
      />
    </div>

    <div v-if="loading" class="text-center py-16">
      <pv-progress-spinner />
      <p class="text-gray-500 mt-4">Analizando detalles de la propiedad...</p>
    </div>
    <div v-else-if="error" class="text-center py-16">
    </div>

    <div v-else-if="property" class="property-details-grid bg-white shadow-xl rounded-lg overflow-hidden">

      <div class="h-64 md:h-full">
        <img
            :src="property.image_url || 'https://via.placeholder.com/600x400'"
            :alt="property.name"
            class="object-cover w-full h-full"
        />
      </div>

      <div class="p-6 md:p-8">

        <h1 class="text-3xl font-bold text-primary mb-2">{{ property.name }}</h1>
        <p class="text-gray-600 text-lg mb-4">
          <i class="pi pi-map-marker text-sm"></i> {{ property.location }}
        </p>
        <p class="text-gray-700 mb-6">
          {{ property.description || 'No hay descripción disponible...' }}
        </p>
        <h3 class="font-semibold text-lg mb-2">Amenidades</h3>
        <div class="flex flex-wrap gap-2 text-sm text-gray-700 mb-6">
        </div>

        <div class="border-t pt-6">
          <h3 class="font-semibold text-xl mb-4 text-primary">
            <i class="pi pi-check-square"></i> Habitaciones Disponibles
          </h3>

          <div v-if="roomsLoading" class="text-center text-sm text-gray-500">
            <i class="pi pi-spin pi-spinner mr-2"></i>
            Buscando habitaciones...
          </div>

          <div v-else-if="availableRooms.length === 0" class="text-center p-4 bg-gray-50 rounded-md">
            <i class="pi pi-info-circle text-gray-500 text-xl"></i>
            <p class="text-gray-600 mt-2">
              No hay habitaciones disponibles para esta propiedad en este momento.
            </p>
          </div>

          <ul v-else class="space-y-4">
            <li
                v-for="room in availableRooms"
                :key="room.id"
                class="flex items-center gap-4 p-3 border rounded-lg shadow-sm"
            >
              <img
                  :src="room.image_url || 'https://via.placeholder.com/150'"
                  :alt="room.type"
                  class="w-24 h-20 object-cover rounded-md flex-shrink-0"
              />
              <div class="flex-grow">
                <h4 class="font-bold text-base">{{ room.name || `Habitación #${room.number}` }}</h4>
                <p class="text-sm text-gray-600">{{ room.type }}</p>
                <p class="text-lg font-semibold text-primary mt-1">
                  ${{ room.price }} <span class="text-xs text-gray-500 font-normal">/ noche</span>
                </p>
              </div>
              <pv-button
                  label="Reservar"
                  icon="pi pi-calendar-plus"
                  class="p-button-success p-button-sm ml-auto"
                  @click="bookRoom(room)"
              />
            </li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useGuestPropertyDetails } from '../composables/useGuestPropertyDetails.js';
import PvButton from 'primevue/button';
import PvProgressSpinner from 'primevue/progressspinner';

// Ahora el composable nos da todo lo que necesitamos
const {
  property,
  loading,
  error,
  roomsLoading,
  availableRooms,
  goBackToList,
  bookRoom // <-- Esta es la nueva función de "tiro"
} = useGuestPropertyDetails();

</script>

<style scoped>
/* (Estilos sin cambios) */
@media (min-width: 768px) {
  .property-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>