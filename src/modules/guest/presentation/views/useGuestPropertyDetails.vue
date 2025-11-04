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
      <i class="pi pi-times-circle text-red-500 text-4xl mb-3"></i>
      <h2 class="text-xl font-semibold text-red-600">Error al cargar</h2>
      <p class="text-gray-600">{{ error }}</p>
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
          {{ property.description || 'No hay descripción disponible para esta propiedad.' }}
        </p>

        <h3 class="font-semibold text-lg mb-2">Amenidades</h3>
        <div class="flex flex-wrap gap-2 text-sm text-gray-700 mb-6">
          <span class="bg-gray-100 px-3 py-1 rounded-full"><i class="pi pi-wifi"></i> WiFi Gratis</span>
          <span class="bg-gray-100 px-3 py-1 rounded-full"><i class="pi pi-car"></i> Parking</span>
          <span class="bg-gray-100 px-3 py-1 rounded-full">🏊 Piscina</span>
        </div>

        <div class="border-t pt-6">
          <p class="text-sm text-gray-500">Precio por noche desde</p>
          <p class="text-4xl font-bold text-primary mb-5">
            ${{ property.base_price || '120' }}
          </p>

          <pv-button
              icon="pi pi-calendar-plus"
              label="¡Reservar Ahora!"
              class="p-button-lg w-full p-button-success"
              @click="bookNow"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useGuestPropertyDetails } from '../composables/useGuestPropertyDetails.js';
import PvButton from 'primevue/button';
import PvProgressSpinner from 'primevue/progressspinner';

// Usamos la "fórmula" que creamos
const {
  property,
  loading,
  error,
  goBackToList,
  bookNow
} = useGuestPropertyDetails();

</script>

<style scoped>
/* Un layout simple de dos columnas para desktop */
@media (min-width: 768px) {
  .property-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>