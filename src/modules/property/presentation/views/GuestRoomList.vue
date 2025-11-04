<template>
  <div class="p-6 max-w-7xl mx-auto">

    <div class="flex items-center justify-between mb-6">

      <div class="flex items-center gap-3">

        <pv-button
            icon="pi pi-arrow-left"
            label="Volver"
            class="p-button-outlined p-button-sm"
            @click="goBackToDashboard"
        />

        <h1 class="text-xl font-semibold text-gray-800">
          🔑 Todas las Habitaciones Disponibles
        </h1>
      </div>


      <pv-button
          icon="pi pi-refresh"
          label="Actualizar"
          class="p-button-sm"
          @click="refreshRooms"
          :loading="loading"
      />
      <language-switcher />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">

      <div>
        <label for="hotel-filter" class="block text-sm font-medium text-gray-700 mb-1">Hotel</label>

        <pv-select
            v-model="selectedHotel"
            :options="allProperties"
            optionLabel="name"
            optionValue="id"
            placeholder="Todos los hoteles"
            class="w-full"
            :showClear="true"
        />
      </div>

      <div>
        <label for="text-filter" class="block text-sm font-medium text-gray-700 mb-1">Buscar por tipo/nombre</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search" />
          <pv-input-text
              v-model="searchTerm"
              placeholder="Ej: Suite, Doble..."
              class="w-full"
          />
        </span>
      </div>

      <div>
        <label for="price-filter" class="block text-sm font-medium text-gray-700 mb-1">
          Precio: ${{ priceRange[0] }} - ${{ priceRange[1] }}
        </label>
        <pv-slider
            v-model="priceRange"
            :range="true"
            :min="0"
            :max="priceSliderMax"
            :step="10"
            class="w-full pt-2"
        />
      </div>
    </div>
    <div v-if="loading" class="text-gray-500 text-center py-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p class="mt-2">Buscando habitaciones...</p>
    </div>

    <div
        v-else-if="filteredAndEnrichedRooms.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
    >
      <div
          v-for="room in filteredAndEnrichedRooms"
          :key="room.id"
          class="room-card bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
      >
        <div class="relative w-20rem h-40 bg-gray-100">
          <img
              :src="room.image_url || 'https://placehold.co/300x200'"
              :alt="room.type"
              class="object-cover w-full h-full"
          />
          <span
              class="absolute bottom-0 left-0 right-0 p-2 text-xs font-bold text-white bg-black bg-opacity-50 truncate"
              :title="room.propertyName"
          >
            <i class="pi pi-building"></i> {{ room.propertyName }}
          </span>
        </div>

        <div class="p-4">
          <h2 class="font-bold text-lg text-gray-800 mb-1 truncate" :title="room.name || `Habitación ${room.number}`">
            {{ room.name || `Habitación ${room.number}` }}
          </h2>
          <p class="text-sm text-gray-600 mb-2">
            Tipo: {{ room.type }}
          </p>
          <p class="text-lg font-semibold text-primary mb-4">
            ${{ room.price }} <span class="text-xs text-gray-500 font-normal">/ noche</span>
          </p>

          <pv-button
              icon="pi pi-sign-in"
              label="Ver Hotel"
              class="p-button-info p-button-sm w-full"
              @click="goToProperty(room.propertyId)"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-gray-500 text-center py-8">
      No se encontraron habitaciones disponibles con esos filtros.
    </div>
  </div>
</template>

<script setup>
// --- 1. Importar "Armas" de Vue y PrimeVue ---
import { ref, onMounted } from 'vue';
import PvButton from 'primevue/button';
import PvInputText from 'primevue/inputtext';
import PvSlider from 'primevue/slider';
import PvSelect from 'primevue/select'; // <-- ¡ARMA 1 CORREGIDA! (Estaba faltando)

// --- 1b. Importar Componente Reutilizable ---
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue"; // <-- ¡ARMA 2 AÑADIDA!

// --- 2. Importar tu "Ego" (El Composable) ---
import { useGuestRoomList } from '../composables/useGuestRoomList.js';

// --- 3. Instanciar el "Ego" y obtener sus "Armas" ---
const {
  loading,
  searchTerm,
  selectedHotel,
  priceRange,
  allProperties,
  filteredAndEnrichedRooms,
  goToProperty,
  refreshRooms,
  goBackToDashboard // <-- ¡ARMA 3 CORREGIDA! (Estaba faltando)
} = useGuestRoomList();

// --- 4. Lógica Adicional para el Slider de Precio ---
const priceSliderMax = ref(500);

onMounted(() => {
  const maxPriceFromData = priceRange.value[1];
  if (maxPriceFromData > priceSliderMax.value) {
    priceSliderMax.value = Math.ceil(maxPriceFromData / 10) * 10;
  }
});
</script>

<style scoped>
/* (Estilos sin cambios) */
.room-card {
  transition: all 0.25s ease-in-out;
}
.room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.text-primary {
  color: var(--primary-color);
}
</style>