<template>
  <div class="surface-ground min-h-screen flex flex-column">
    <pv-toast position="bottom-right" />

    <pv-toolbar class="sticky top-0 z-5 shadow-1 border-none px-4 md:px-6 py-3 adaptive-toolbar">
      <template #start>
        <div class="flex align-items-center gap-2 cursor-pointer" @click="goHome">
          <i class="pi pi-building text-primary text-3xl"></i>
          <span class="text-xl font-bold app-title">SmartStay</span>
        </div>
      </template>
      <template #end>
        <div class="flex gap-2">
          <pv-button label="Volver al Dashboard" icon="pi pi-arrow-left" class="p-button-text" @click="goHome" />
        </div>
      </template>
    </pv-toolbar>

    <div class="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto">

      <div class="flex flex-column md:flex-row justify-content-between align-items-center mb-5 gap-3">
        <div>
          <h1 class="text-3xl font-bold text-900 m-0">Nuestros Hoteles</h1>
          <p class="text-600 mt-2">Explora estancias únicas alrededor del mundo.</p>
        </div>
        <span class="p-input-icon-left w-full md:w-auto">
          <i class="pi pi-search" />
          <pv-input-text v-model="searchQuery" placeholder="Buscar por ciudad o nombre..." class="w-full" />
        </span>
      </div>

      <div v-if="hotelStore.loading" class="flex justify-content-center p-6">
        <pv-progress-spinner />
      </div>

      <div v-else-if="filteredHotels.length === 0" class="surface-card p-6 border-round-xl text-center shadow-1">
        <i class="pi pi-building text-5xl text-gray-300 mb-3"></i>
        <h3>No encontramos hoteles con ese criterio.</h3>
        <pv-button label="Ver todos" class="p-button-outlined" @click="searchQuery = ''" />
      </div>

      <div v-else class="grid">
        <div v-for="hotel in filteredHotels" :key="hotel.id" class="col-12 md:col-6 lg:col-4">
          <div class="surface-card shadow-2 border-round-xl h-full flex flex-column overflow-hidden hover:shadow-4 transition-duration-300 cursor-pointer" @click="viewHotelDetails(hotel.id)">

            <div class="relative h-15rem w-full bg-gray-100">
              <img :src="hotel.photoUrl || 'https://placehold.co/600x400/e2e8f0/1e293b?text=SmartStay'" alt="Hotel" class="w-full h-full object-cover" />
              <div class="absolute top-0 right-0 m-3">
                <pv-tag :value="hotel.rating + ' ★'" severity="warning" rounded></pv-tag>
              </div>
            </div>

            <div class="p-4 flex-1 flex flex-column justify-content-between">
              <div>
                <div class="flex justify-content-between align-items-start mb-2">
                  <h2 class="text-xl font-bold text-900 m-0">{{ hotel.name }}</h2>
                </div>

                <div class="text-600 flex align-items-center gap-2 mb-3 text-sm">
                  <i class="pi pi-map-marker text-primary"></i>
                  {{ hotel.location }}
                </div>

                <p class="text-600 line-height-3 text-sm mb-4">
                  {{ truncateText(hotel.description, 100) }}
                </p>

                <div class="flex gap-2 flex-wrap mb-4">
                  <span v-for="amenity in (hotel.amenities || []).slice(0, 3)" :key="amenity" class="surface-100 text-600 border-round px-2 py-1 text-xs font-medium uppercase">
                    {{ amenity }}
                  </span>
                  <span v-if="hotel.amenities?.length > 3" class="text-xs text-500 flex align-items-center">
                    +{{ hotel.amenities.length - 3 }}
                  </span>
                </div>
              </div>

              <div class="border-top-1 border-200 pt-3 flex justify-content-between align-items-center mt-auto">
                <div>
                  <span class="text-xs text-500 block">Precio por noche</span>
                  <span class="text-xl font-bold text-900">${{ hotel.basePrice }}</span>
                </div>
                <pv-button icon="pi pi-arrow-right" class="p-button-rounded p-button-outlined" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Import the store created previously
import { useHotelStore } from '../../application/hotel.store.js';

const router = useRouter();
const hotelStore = useHotelStore();
const searchQuery = ref('');

// --- Fetch Data on Mount ---
onMounted(async () => {
  await hotelStore.fetchAllHotels();
});

// --- Computed Filter ---
/**
 * @type {import('vue').ComputedRef<Array<Hotel>>} filteredHotels - Filtered list of hotels based on search query.
 */
const filteredHotels = computed(() => {
  if (!searchQuery.value) return hotelStore.hotels;
  const lowerQuery = searchQuery.value.toLowerCase();
  return hotelStore.hotels.filter(h =>
      h.name.toLowerCase().includes(lowerQuery) ||
      h.city.toLowerCase().includes(lowerQuery) ||
      h.country.toLowerCase().includes(lowerQuery)
  );
});

// --- Actions ---
/**
 * Navigates to the home dashboard.
 */
function goHome() {
  router.push({ name: 'dashboard' });
}

/**
 * Views the details of a specific hotel.
 * @param {number} hotelId - The ID of the hotel to view.
 */
function viewHotelDetails(hotelId) {
  // Logic to go to rooms of this hotel (Future implementation)
  // router.push({ name: 'hotel-rooms', params: { hotelId } });
  console.log("Navigating to hotel:", hotelId);
}

/**
 * Truncates text to a specified length.
 * @param {string} text - The text to truncate.
 * @param {number} length - The maximum length.
 * @returns {string} The truncated text.
 */
function truncateText(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}
</script>

<style scoped>
/* Adaptive Toolbar Styles (Same as Dashboard) */
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
</style>