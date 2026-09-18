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
          <h3 class="text-3xl font-bold text-color m-0">{{ $t('guestCreateBooking.title') }}</h3>
        </div>
        <pv-button
            :label="currentLocale.toUpperCase()"
            icon="pi pi-globe"
            class="p-button-text p-button-rounded language-btn"
            @click="toggleLanguage"
            v-tooltip.bottom="$t('common.changeLanguage')"
        />
      </div>

      <pv-card class="surface-card shadow-2 border-round-xl">
        <template #content>
          <div class="grid p-fluid">
            <div class="col-12 mb-4">
              <label class="block font-bold mb-2 text-color">{{ $t('guestCreateBooking.selectedRoom') }}</label>
              <div class="surface-ground p-4 border-round-xl border-1 surface-border flex align-items-center gap-3">
                <i class="pi pi-key text-primary text-2xl"></i>
                <div class="flex flex-column">
                  <span class="text-sm text-color-secondary">{{ $t('guestCreateBooking.roomId') }}</span>
                  <span class="text-2xl font-bold text-color">{{ form.roomId || $t('guestCreateBooking.noRoomSelected') }}</span>
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="guestName" class="font-medium text-color">{{ $t('guestCreateBooking.guestName') }}</label>
                <pv-input-text id="guestName" v-model="form.guestName" class="w-full" />
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="guestEmail" class="font-medium text-color">{{ $t('guestCreateBooking.contactEmail') }}</label>
                <pv-input-text id="guestEmail" v-model="form.guestEmail" class="w-full" disabled />
                <small class="text-color-secondary">{{ $t('guestCreateBooking.linkedToAccount') }}</small>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="checkInDate" class="font-medium text-color">{{ $t('guestCreateBooking.arrival') }}</label>
                <pv-input-text id="checkInDate" v-model="form.checkInDate" type="datetime-local" class="w-full" />
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="checkOutDate" class="font-medium text-color">{{ $t('guestCreateBooking.departure') }}</label>
                <pv-input-text id="checkOutDate" v-model="form.checkOutDate" type="datetime-local" class="w-full" />
              </div>
            </div>

            <div class="col-12 mt-5">
              <pv-button
                  :label="$t('guestCreateBooking.confirmAndBook')"
                  icon="pi pi-check"
                  class="p-button-primary w-full p-button-lg font-bold"
                  :loading="bookingStore.loading"
                  @click="submitForm"
              />
            </div>
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';
import useIamStore from '@/iam/application/iam.store.js';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const bookingStore = useBookingStore();
const iamStore = useIamStore();
const { t, locale } = useI18n();

const currentLocale = computed(() => locale.value);

function toggleLanguage() {
  const newLocale = locale.value === 'en' ? 'es' : 'en';
  locale.value = newLocale;
  localStorage.setItem('language', newLocale);
}

const form = ref({
  roomId: route.params.roomId ? Number(route.params.roomId) : null,
  guestName: '',
  guestEmail: '',
  checkInDate: '',
  checkOutDate: ''
});

onMounted(() => {
  // Load saved language
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }

  const user = iamStore.users.find(u => u.id === iamStore.currentUserId);
  if (user) {
    form.value.guestName = user.username.split('@')[0];
    form.value.guestEmail = user.username;
  }
});

const goBack = () => router.push({ name: 'guest-rooms' });

const submitForm = async () => {
  if (!form.value.roomId || !form.value.checkInDate || !form.value.checkOutDate) {
    toast.add({
      severity: 'warn',
      summary: t('guestCreateBooking.missingData'),
      detail: t('guestCreateBooking.checkDatesAndRoom'),
      life: 3000
    });
    return;
  }

  try {
    const payload = {
      roomId: form.value.roomId,
      guestName: form.value.guestName,
      guestEmail: form.value.guestEmail,
      checkInDate: new Date(form.value.checkInDate).toISOString(),
      checkOutDate: new Date(form.value.checkOutDate).toISOString()
    };

    await bookingStore.createBooking(payload);

    toast.add({
      severity: 'success',
      summary: t('guestCreateBooking.bookingCreated'),
      detail: t('guestCreateBooking.seeSoon'),
      life: 3000
    });
    router.push({ name: 'guest-bookings' });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('guestCreateBooking.couldNotCreate'),
      life: 3000
    });
  }
};
</script>

<style scoped>
.language-btn {
  min-width: 3rem;
}
</style>