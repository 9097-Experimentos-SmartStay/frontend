<template>
  <div class="p-6 max-w-7xl mx-auto">

    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver al Dashboard"
            class="p-button-outlined p-button-sm"
            @click="goBackToDashboard"
        />
        <h1 class="text-xl font-semibold text-gray-800">
          🏨 Explora Nuestras Propiedades
        </h1>
      </div>

      <pv-button
          icon="pi pi-refresh"
          label="Actualizar"
          class="p-button-sm"
          @click="refreshProperties"
          :loading="loading"
      />
    </div>

    <div class="mb-6">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search" />
        <pv-input-text
            v-model="searchTerm"
            placeholder="Buscar por nombre o ubicación..."
            class="w-full"
        />
      </span>
    </div>

    <div v-if="loading" class="text-gray-500 text-center py-8">
      Buscando las mejores propiedades...
    </div>

    <div
        v-else-if="filteredProperties.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
    >
      <div
          v-for="property in filteredProperties"
          :key="property.id"
          class="property-card bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
      >
        <div class="relative w-full h-40 bg-gray-100">
          <img
              :src="property.image_url || 'https://via.placeholder.com/300'"
              :alt="property.name"
              class="object-cover w-full h-full"
          />
          <span
              v-if="property.promotion"
              class="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-md text-white bg-red-600"
          >
            ¡Oferta!
          </span>
        </div>

        <div class="p-4">
          <h2 class="font-bold text-lg text-gray-800 mb-1 truncate" :title="property.name">
            {{ property.name }}
          </h2>

          <p class="text-sm text-gray-600 mb-2">
            <i class="pi pi-map-marker text-xs"></i> {{ property.location }}
          </p>

          <p class="text-sm text-gray-500 mb-3">
            Tipo: {{ property.type || 'Hotel' }}
          </p>

          <pv-button
              icon="pi pi-eye"
              label="Ver Hotel"
              class="p-button-info p-button-sm w-full"
              @click="goToPropertyDetails(property.id)"
          />

        </div>
      </div>
    </div>

    <div v-else class="text-gray-500 text-center py-8">
      No se encontraron propiedades que coincidan con tu búsqueda.
    </div>

  </div>
</template>

<script setup>
import { useGuestProperties } from '../composables/useGuestProperties.js'; // Ajusta la ruta
import PvButton from 'primevue/button';
import PvInputText from 'primevue/inputtext';

// Usamos el "Ego" del delantero
const {
  loading,
  searchTerm,
  filteredProperties,
  goToPropertyDetails,
  goBackToDashboard,
  refreshProperties
} = useGuestProperties();

</script>

<style scoped>
/* Estilo reutilizado, ¡perfecto! */
.property-card {
  transition: all 0.25s ease-in-out;
}
.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>