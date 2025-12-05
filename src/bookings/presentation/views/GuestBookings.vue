<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="flex justify-content-between align-items-center mb-6">
      <div class="flex align-items-center gap-3">
        <pv-button
            icon="pi pi-arrow-left"
            :label="$t('common.back')"
            class="p-button-outlined p-button-sm"
            @click="goBack"
        />
        <h3 class="text-3xl font-bold text-color m-0">{{ $t('guestBookings.title') }}</h3>
      </div>
      <pv-button
          :label="currentLocale.toUpperCase()"
          icon="pi pi-globe"
          class="p-button-text p-button-rounded language-btn"
          @click="toggleLanguage"
          v-tooltip.bottom="$t('common.changeLanguage')"
      />
    </div>

    <div v-if="bookingStore.loading" class="flex flex-column align-items-center justify-content-center h-20rem">
      <pv-progress-spinner />
      <p class="text-color-secondary mt-3">{{ $t('guestBookings.loading') }}</p>
    </div>

    <pv-data-table
        v-else-if="bookingStore.bookings.length"
        :value="bookingStore.bookings"
        responsive-layout="scroll"
        class="shadow-2 border-round-xl overflow-hidden"
        paginator :rows="5"
        tableStyle="min-width: 50rem"
    >
      <template #header>
        <div class="flex align-items-center justify-content-between p-3 surface-card border-bottom-1 surface-border">
          <span class="text-xl font-bold text-color">{{ $t('guestBookings.travelHistory') }}</span>
          <pv-button
              icon="pi pi-refresh"
              class="p-button-rounded p-button-text"
              @click="fetchData"
              v-tooltip="$t('common.refresh')"
          />
        </div>
      </template>

      <pv-column field="id" header="ID" sortable style="width: 10%"></pv-column>
      <pv-column field="roomId" :header="$t('guestBookings.room')" sortable style="width: 15%"></pv-column>

      <pv-column :header="$t('guestBookings.dates')" style="width: 30%">
        <template #body="{ data }">
          <div class="flex flex-column">
            <span class="font-medium text-color">{{ formatDate(data.checkInDate) }}</span>
            <span class="text-color-secondary text-sm">{{ $t('guestBookings.until') }} {{ formatDate(data.checkOutDate) }}</span>
          </div>
        </template>
      </pv-column>

      <pv-column field="status" :header="$t('guestBookings.status')" sortable style="width: 15%">
        <template #body="{ data }">
          <pv-tag :value="translateStatus(data.status)" :severity="getStatusSeverity(data.status)" rounded />
        </template>
      </pv-column>

      <pv-column :header="$t('guestBookings.actions')" style="width: 30%">
        <template #body="{ data }">
          <div class="flex gap-2">
            <pv-button
                icon="pi pi-eye"
                class="p-button-rounded p-button-text p-button-info"
                @click="viewBooking(data.id)"
                v-tooltip="$t('guestBookings.viewDetails')"
            />
            <pv-button
                v-if="data.status === 'Pending'"
                icon="pi pi-times"
                class="p-button-rounded p-button-text p-button-danger"
                @click="cancelBooking(data.id)"
                v-tooltip="$t('guestBookings.cancelBooking')"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 surface-card border-round-xl shadow-1 border-1 surface-border">
      <div class="surface-ground border-circle w-6rem h-6rem flex align-items-center justify-content-center mx-auto mb-4">
        <i class="pi pi-calendar-times text-500 text-5xl"></i>
      </div>
      <h3 class="text-color font-bold m-0 mb-2">{{ $t('guestBookings.noActiveBookings') }}</h3>
      <p class="text-color-secondary mb-4">{{ $t('guestBookings.planningEscape') }}</p>
      <pv-button
          :label="$t('guestBookings.exploreRooms')"
          icon="pi pi-search"
          class="p-button-primary"
          @click="createBooking"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';

const router = useRouter();
const toast = useToast();
const bookingStore = useBookingStore();
const { t, locale } = useI18n();

const currentLocale = computed(() => locale.value);

function toggleLanguage() {
  const newLocale = locale.value === 'en' ? 'es' : 'en';
  locale.value = newLocale;
  localStorage.setItem('language', newLocale);
}

const fetchData = async () => {
  await bookingStore.fetchAllBookings();
};

onMounted(() => {
  // Load saved language
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }

  fetchData();
});

const goBack = () => router.push({ name: 'guest-dashboard' });
const viewBooking = (bookingId) => router.push({ name: 'guest-booking-detail', params: { bookingId } });
const createBooking = () => router.push({ name: 'guest-rooms' });

const cancelBooking = async (bookingId) => {
  try {
    await bookingStore.cancelBooking(bookingId);
    toast.add({
      severity: 'success',
      summary: t('guestBookings.cancelled'),
      detail: t('guestBookings.cancelledSuccess'),
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('guestBookings.cancelledError'),
      life: 3000
    });
  }
};

const getStatusSeverity = (status) => {
  const map = { 'Pending': 'warning', 'Confirmed': 'success', 'Cancelled': 'danger' };
  return map[status] || 'info';
};

const translateStatus = (status) => {
  const statusMap = {
    'Pending': t('bookings.statusPending'),
    'Confirmed': t('bookings.statusConfirmed'),
    'Cancelled': t('bookings.statusCancelled')
  };
  return statusMap[status] || status;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US');
};
</script>

<style scoped>
.language-btn {
  min-width: 3rem;
}
</style>