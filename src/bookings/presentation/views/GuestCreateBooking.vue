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
                <pv-input-text id="checkInDate" v-model="form.checkInDate" type="date" :min="today" class="w-full" :invalid="!!dateError" />
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="checkOutDate" class="font-medium text-color">{{ $t('guestCreateBooking.departure') }}</label>
                <pv-input-text id="checkOutDate" v-model="form.checkOutDate" type="date" :min="form.checkInDate || today" class="w-full" :invalid="!!dateError" />
              </div>
            </div>

            <div class="col-12">
              <small v-if="dateError" class="p-error block">{{ dateError }}</small>
              <span v-else-if="nights > 0" class="text-color-secondary">{{ $t('guestCreateBooking.nightsSummary', { count: nights }, nights) }}</span>
            </div>

            <pv-message v-if="conflictMessage" severity="error" class="col-12">{{ conflictMessage }}</pv-message>

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
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';
import { CreateBookingCommand } from '../../domain/commands/create-booking.command.js';
import useIamStore from '@/iam/application/iam.store.js';
import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { apiErrorKey } from '@/shared/presentation/utils/api-error.js';

/**
 * A guest books a room. Dates are calendar days (check-in/check-out); the backend rejects
 * overlapping bookings of the same room with 409 (no overbooking, R1).
 */
const router = useRouter();
const route = useRoute();
const toast = useToast();
const bookingStore = useBookingStore();
const iamStore = useIamStore();
const { t, locale } = useI18n();

const currentLocale = computed(() => locale.value);
const today = CalendarDate.today().toIsoString();

function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'es' : 'en';
  localStorage.setItem('language', locale.value);
}

// The booking belongs to the signed-in guest (the backend takes the owner from the token).
const form = ref({
  roomId: route.params.roomId ? Number(route.params.roomId) : null,
  guestName: iamStore.currentUser?.displayName ?? '',
  guestEmail: iamStore.currentUser?.email ?? '',
  checkInDate: '',
  checkOutDate: ''
});
const submitted = ref(false);
const conflictMessage = ref('');

const command = computed(() => new CreateBookingCommand(form.value));
const nights = computed(() => command.value.nights);
const dateError = computed(() => {
  if (!submitted.value) return '';
  const rule = command.value.validate();
  return rule && rule !== 'roomRequired' ? t(`guestCreateBooking.rules.${rule}`) : '';
});

const goBack = () => router.push({ name: 'guest-rooms' });

const submitForm = async () => {
  submitted.value = true;
  conflictMessage.value = '';
  const rule = command.value.validate();
  if (rule) {
    toast.add({ severity: 'warn', summary: t('guestCreateBooking.missingData'), detail: t(`guestCreateBooking.rules.${rule}`), life: 4000 });
    return;
  }

  try {
    const booking = await bookingStore.createBooking(command.value);
    toast.add({ severity: 'success', summary: t('guestCreateBooking.bookingCreated'), detail: t('guestCreateBooking.seeSoon'), life: 3000 });
    // A new booking is Pending: show the code, total and how to pay within 24 hours.
    router.push({ name: 'guest-payment', params: { bookingId: booking.id } });
  } catch (err) {
    // 409: the room is taken for some of those nights → choose other dates or another room.
    conflictMessage.value = t(apiErrorKey(err, {
      400: 'guestCreateBooking.invalidRequest',
      409: 'guestCreateBooking.roomNotAvailable'
    }));
  }
};
</script>

<style scoped>
.language-btn {
  min-width: 3rem;
}
</style>