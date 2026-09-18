<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-4xl">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button
              icon="pi pi-arrow-left"
              :label="$t('common.back')"
              class="p-button-outlined p-button-sm"
              @click="goBack"
          />
          <h3 class="text-3xl font-bold text-color m-0">{{ $t('guestBookingDetail.bookingNumber', { id: bookingId }) }}</h3>
        </div>
        <pv-button
            :label="currentLocale.toUpperCase()"
            icon="pi pi-globe"
            class="p-button-text p-button-rounded language-btn"
            @click="toggleLanguage"
            v-tooltip.bottom="$t('common.changeLanguage')"
        />
      </div>

      <div v-if="bookingStore.loading" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <pv-card v-else-if="booking" class="surface-card shadow-2 border-round-xl">
        <template #content>
          <div class="grid p-fluid">
            <div class="col-12">
              <div class="flex justify-content-between align-items-center mb-4">
                <span class="text-xl font-bold text-color">{{ $t('guestBookingDetail.bookingStatus') }}</span>
                <pv-tag :value="translateStatus(booking.status)" :severity="getStatusSeverity(booking.status)" class="text-lg px-3 py-2" rounded />
              </div>
              <div class="border-top-1 surface-border mb-4"></div>
            </div>

            <div class="col-12 md:col-6 mb-4">
              <span class="text-color-secondary block mb-2 font-medium">{{ $t('guestBookingDetail.room') }}</span>
              <span class="text-2xl font-bold text-primary">#{{ booking.roomId }}</span>
            </div>

            <div class="col-12 md:col-6 mb-4">
              <span class="text-color-secondary block mb-2 font-medium">{{ $t('guestBookingDetail.mainGuest') }}</span>
              <span class="text-xl font-bold text-color">{{ booking.guestName }}</span>
              <div class="text-sm text-color-secondary mt-1">{{ booking.guestEmail }}</div>
            </div>

            <div class="col-12 md:col-6 mb-4">
              <span class="text-color-secondary block mb-2 font-medium">{{ $t('guestBookingDetail.checkIn') }}</span>
              <div class="surface-ground p-3 border-round border-1 surface-border flex align-items-center gap-3">
                <i class="pi pi-calendar-plus text-primary text-xl"></i>
                <span class="text-xl font-medium text-color">{{ formatDate(booking.checkInDate) }}</span>
              </div>
            </div>

            <div class="col-12 md:col-6 mb-4">
              <span class="text-color-secondary block mb-2 font-medium">{{ $t('guestBookingDetail.checkOut') }}</span>
              <div class="surface-ground p-3 border-round border-1 surface-border flex align-items-center gap-3">
                <i class="pi pi-calendar-minus text-orange-500 text-xl"></i>
                <span class="text-xl font-medium text-color">{{ formatDate(booking.checkOutDate) }}</span>
              </div>
            </div>

            <div class="col-12 flex gap-2 mt-4 pt-4 border-top-1 surface-border">
              <pv-button
                  v-if="booking.status === 'Pending'"
                  :label="$t('guestBookingDetail.cancelBooking')"
                  icon="pi pi-times"
                  class="p-button-danger p-button-outlined w-auto"
                  @click="cancelBooking"
              />
              <pv-button
                  v-if="booking.status === 'Pending'"
                  :label="$t('guestBookingDetail.payNow')"
                  icon="pi pi-credit-card"
                  class="p-button-success p-button-outlined"
                  @click="goToPayment"
              />
            </div>
          </div>
        </template>
      </pv-card>

      <div v-else class="text-center p-8 surface-card border-round-xl border-1 surface-border shadow-1">
        <i class="pi pi-search text-500 text-6xl mb-4"></i>
        <p class="text-xl text-color font-medium">{{ $t('guestBookingDetail.bookingNotFound') }}</p>
        <pv-button
            :label="$t('guestBookingDetail.backToList')"
            class="mt-3 p-button-text"
            @click="goBack"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';

const props = defineProps({
  bookingId: { type: [String, Number], required: true }
});

const router = useRouter();
const toast = useToast();
const bookingStore = useBookingStore();
const { t, locale } = useI18n();
const booking = ref(null);

const currentLocale = computed(() => locale.value);

function toggleLanguage() {
  const newLocale = locale.value === 'en' ? 'es' : 'en';
  locale.value = newLocale;
  localStorage.setItem('language', newLocale);
}

onMounted(async () => {
  // Load saved language
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }

  if (bookingStore.bookings.length === 0) {
    await bookingStore.fetchAllBookings();
  }
  booking.value = bookingStore.bookings.find(b => String(b.id) === String(props.bookingId));
});

const goBack = () => router.push({ name: 'guest-bookings' });
const goToPayment = () => {
  router.push({ name: 'guest-payment', params: { bookingId: props.bookingId } });
};

const cancelBooking = async () => {
  try {
    await bookingStore.cancelBooking(Number(props.bookingId));
    toast.add({
      severity: 'success',
      summary: t('guestBookings.cancelled'),
      life: 3000
    });
    booking.value.status = 'Cancelled';
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
  const localeStr = locale.value === 'es' ? 'es-ES' : 'en-US';
  return new Date(date).toLocaleDateString(localeStr, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.language-btn {
  min-width: 3rem;
}
</style>