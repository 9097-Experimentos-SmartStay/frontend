<template>
  <div class="p-6 max-w-6xl mx-auto">
    <pv-toast position="bottom-right" />
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-primary mb-1">🛏️ {{ t('guestDashboard.title') }}</h1>
        <p class="text-sm text-gray-600">{{ t('guestDashboard.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <pv-button
            icon="pi pi-home"
            :label="t('guestDashboard.viewProperties')"
            class="p-button-outlined"
            @click="goToProperties"
        />
        <pv-button
            icon="pi pi-calendar"
            :label="t('guestDashboard.myBookings')"
            class="p-button-secondary"
            @click="goToBookings"
        />
        <pv-button icon="pi pi-sign-out" :label="t('dashboard.logoutButton')" class="p-button-danger" @click="logout" />
      </div>

      <language-switcher></language-switcher>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="rounded-lg border p-4 bg-white shadow-sm">
        <p class="text-xs text-gray-500">{{ t('guestDashboard.upcomingBookings') }}</p>
        <p class="text-2xl font-bold">{{ stats.upcoming }}</p>
      </div>
      <div class="rounded-lg border p-4 bg-white shadow-sm">
        <p class="text-xs text-gray-500">{{ t('guestDashboard.activeServices') }}</p>
        <p class="text-2xl font-bold">{{ stats.services }}</p>
      </div>
      <div class="rounded-lg border p-4 bg-white shadow-sm">
        <p class="text-xs text-gray-500">{{ t('guestDashboard.recommendations') }}</p>
        <p class="text-2xl font-bold">{{ recommendations.length }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <pv-card class="bg-white">
        <template #title>
          <div class="flex justify-between items-center">
            <span class="font-semibold">{{ t('guestDashboard.upcomingBookings') }}</span>
            <pv-button class="p-button-text" :label="t('guestDashboard.viewAll')" @click="goToBookings" />
          </div>
        </template>

        <template #content>
          <div v-if="loading" class="text-center py-8">{{ t('common.loading') }}</div>
          <div v-else>
            <div v-if="upcomingBookings.length === 0" class="text-gray-500 italic">
              {{ t('guestDashboard.noUpcoming') }}
            </div>

            <ul v-else class="space-y-3">
              <li v-for="b in upcomingBookings" :key="b.id" class="p-3 border rounded-md flex items-start justify-between gap-3">
                <div>
                  <div class="font-semibold">#{{ getRoomNumber(b.roomId) }} — {{ b.propertyName || b.propertyId }}</div>
                  <div class="text-xs text-gray-600">
                    {{ formatDate(b.checkIn) }} → {{ formatDate(b.checkOut) }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">Estado: <strong>{{ translateBookingStatus(b.status) }}</strong></div>
                </div>

                <div class="flex flex-col items-end gap-2">
                  <pv-button v-if="canCancel(b)" size="small" class="p-button-danger p-button-sm" icon="pi pi-times" :label="t('guestDashboard.cancel')" @click="cancelBooking(b)" />
                  <pv-button v-else size="small" class="p-button-outlined p-button-sm" icon="pi pi-info-circle" :label="t('guestDashboard.details')" @click="openBooking(b)" />
                </div>
              </li>
            </ul>
          </div>
        </template>
      </pv-card>

      <pv-card class="bg-white">
        <template #title>
          <div class="flex justify-between items-center">
            <span class="font-semibold">{{ t('guestDashboard.recommendationsTitle') }}</span>
            <pv-button class="p-button-text" :label="t('guestDashboard.refresh')" @click="loadDashboard" />
          </div>
        </template>

        <template #content>
          <div class="mb-3">
            <p class="text-sm text-gray-600">{{ t('guestDashboard.recommendationsSubtitle') }}</p>
          </div>

          <div v-if="recommendations.length === 0" class="text-gray-500 italic">
            {{ t('guestDashboard.noRecommendations') }}
          </div>

          <ul v-else class="space-y-2">
            <li v-for="(r, idx) in recommendations" :key="idx" class="p-3 border rounded-md flex justify-between items-center">
              <div>
                <div class="font-medium">{{ r.title }}</div>
                <div class="text-xs text-gray-600">{{ r.description }}</div>
              </div>
              <pv-button class="p-button-sm" icon="pi pi-arrow-right" @click="goToProperty(r.propertyId)" />
            </li>
          </ul>

          <div class="mt-4">
            <h4 class="font-semibold mb-2">{{ t('guestDashboard.quickServices') }}</h4>
            <div class="flex gap-2 flex-wrap">
              <pv-button icon="pi pi-concierge-bell" :label="t('guestDashboard.requestService')" class="p-button-info" @click="requestService" />
              <pv-button icon="pi pi-comment" :label="t('guestDashboard.leaveReview')" class="p-button-outlined" @click="goToReview" />
              <pv-button icon="pi pi-map-marker" :label="t('guestDashboard.viewMap')" class="p-button-secondary" @click="goToProperties" />
            </div>
          </div>
        </template>
      </pv-card>
    </div>

    <div class="mt-6">
      <pv-card>
        <template #title>
          <div class="flex justify-between items-center">
            <span class="font-semibold">{{ t('guestDashboard.recentProperties') }}</span>
            <pv-button class="p-button-text" :label="t('guestDashboard.viewAll')" @click="goToProperties" />
          </div>
        </template>

        <template #content>
          <div v-if="properties.length === 0" class="text-gray-500 italic">{{ t('guestDashboard.noProperties') }}</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div v-for="p in properties" :key="p.id" class="p-2 border rounded-md flex flex-col">
              <img :src="p.image_url || placeholderImg" class="w-full h-28 object-cover rounded" alt="prop-img" />
              <div class="mt-2">
                <div class="font-medium">{{ p.name }}</div>
                <div class="text-xs text-gray-600">{{ p.location }}</div>
              </div>
              <div class="mt-2 self-end">
                <pv-button size="small" class="p-button-sm p-button-outlined" icon="pi pi-eye" @click="goToProperty(p.id)" />
              </div>
            </div>
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script setup>
import { useGuestDashboard } from "../../application/useGuestDashboard.js";
import { onMounted, onActivated } from 'vue';
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue";
import { useI18n } from "vue-i18n";

// --- [NUEVO] Importa las "armas" directamente ---
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../../shared/application/store/user_store.js';

const {t,  locale } = useI18n();

// --- [NUEVO] Instancia las "armas" ---
const router = useRouter();
const userStore = useUserStore();


const {
  loading,
  upcomingBookings,
  properties,
  recommendations,
  stats,
  placeholderImg,
  loadDashboard,
  goToProperties,
  goToBookings,
  goToReview,
  requestService,

  // --- [AÑADE ESTAS LÍNEAS QUE FALTABAN] ---
  goToProperty,
  formatDate,
  translateBookingStatus,
  canCancel,
  cancelBooking,
  openBooking,
  getRoomNumber
} = useGuestDashboard();

onMounted(loadDashboard);
onActivated(loadDashboard);

// --- [NUEVO] Táctica de Logout de Admin/Staff ---
// Esta función SÍ funcionará porque es síncrona.
function logout() {
  console.log('GuestDashboard.vue: Ejecutando táctica de logout síncrona...');

  // 1. (Opcional pero recomendado) Llama al store para limpiar Pinia
  userStore.logout();

  // 2. [LA CLAVE] Limpia localStorage INMEDIATAMENTE
  localStorage.clear();

  console.log('GuestDashboard.vue: Almacenamiento limpio. Navegando a login.');

  // 3. Navega. El auth_guard ahora verá localStorage vacío.
  router.push({ name: 'login' });
}

</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
</style>