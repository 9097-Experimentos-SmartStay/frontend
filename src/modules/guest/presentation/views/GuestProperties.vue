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
      <pv-card
          v-for="property in filteredProperties"
          :key="property.id"
          class="property-card rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100"
      >
        <template #header>
          <div class="relative w-full h-40 bg-gray-100">
            <img
                :src="property.image_url || 'https://placehold.co/300x200'"
                :alt="property.name"
                class="object-cover w-full h-full"
            />
          </div>
        </template>

        <template #content>
          <h2 class="font-bold text-lg text-gray-800 mb-1 truncate" :title="property.name">
            {{ property.name }}
          </h2>
          <p class="text-sm text-gray-600 mb-2">
            <i class="pi pi-map-marker text-xs"></i> {{ property.location }}
          </p>
          <p class="text-sm text-gray-500 mb-3">
            Tipo: {{ property.type || 'Hotel' }}
          </p>
          <p class="text-xs text-gray-600 mb-3" style="min-height: 40px;">
            {{ property.description ? property.description.substring(0, 60) + '...' : 'Sin descripción.' }}
          </p>
          <div class="flex flex-wrap gap-2 text-xs text-gray-700 mb-4" style="min-height: 28px;">
            <span v-if="property.amenities && property.amenities.includes('wifi')" class="bg-gray-100 px-2 py-1 rounded-full">
              <i class="pi pi-wifi"></i> WiFi
            </span>
            <span v-if="property.amenities && property.amenities.includes('piscina')" class="bg-gray-100 px-2 py-1 rounded-full">
              🏊 Piscina
            </span>
          </div>
          <p class="text-xl font-bold text-primary mb-4">
            Desde ${{ property.base_price }}
            <span class="text-xs font-normal text-gray-500">/ noche</span>
          </p>
          <pv-button
              icon="pi pi-eye"
              label="Ver Hotel"
              class="p-button-info p-button-sm w-full"
              @click="goToPropertyDetails(property.id)"
          />
        </template>
      </pv-card>
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

// (El script está perfecto, no necesita cambios)
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
/* (Los estilos están perfectos, no necesitan cambios) */
.property-card {
  transition: all 0.25s ease-in-out;
}
.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
/* Añadido para el color del precio */
.text-primary {
  color: var(--primary-color);
}
</style>