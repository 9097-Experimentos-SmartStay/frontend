<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-6xl">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="goBack" />
          <h1 class="text-3xl font-bold text-color m-0">{{ t('guestPayment.title') }}</h1>
        </div>
      </div>

      <div v-if="loadingData" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <!-- Approved: the amount is the one charged by the backend -->
      <div v-else-if="payment?.isCompleted()" class="surface-card shadow-2 border-round-xl p-5 text-center">
        <i class="pi pi-check-circle text-green-500 text-6xl mb-3"></i>
        <h2 class="text-2xl font-bold text-color mt-0">{{ t('guestPayment.successTitle') }}</h2>
        <p class="text-color-secondary">{{ t('guestPayment.successMessage') }}</p>
        <div class="inline-flex flex-column gap-2 text-left surface-ground border-round p-3 my-3">
          <span><strong>{{ t('payments.amount') }}:</strong> {{ formatMoney(payment.amount, locale) }}</span>
          <span><strong>{{ t('guestPayment.card') }}:</strong> {{ payment.cardNumberMasked }}</span>
          <span><strong>{{ t('payments.date') }}:</strong> {{ formatDateTime(payment.paymentDate, locale) }}</span>
          <span class="text-sm text-color-secondary">{{ t('guestPayment.transaction', { id: payment.transactionId }) }}</span>
        </div>
        <div>
          <pv-button :label="t('guestPayment.viewBooking')" icon="pi pi-calendar" @click="goBack" />
        </div>
      </div>

      <div v-else-if="booking" class="grid">
        <div class="col-12 lg:col-7">
          <pv-card class="surface-card shadow-2 border-round-xl h-full">
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <span class="text-xl font-bold text-color">{{ t('payments.paymentMethod') }}</span>
                <i class="pi pi-credit-card text-2xl text-primary"></i>
              </div>
            </template>
            <template #content>
              <pv-message v-if="payment?.isFailed()" severity="error" class="mb-3">{{ t('guestPayment.declined') }}</pv-message>
              <pv-message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</pv-message>

              <form class="p-fluid grid formgrid mt-2" novalidate @submit.prevent="submitPayment">
                <div class="col-12 mb-3">
                  <label for="cardHolderName" class="font-medium text-color mb-2 block">{{ t('payments.cardholderName') }}</label>
                  <pv-input-text id="cardHolderName" v-model="paymentForm.cardHolderName" autocomplete="cc-name" :placeholder="t('guestPayment.cardHolderPlaceholder')" :invalid="!!errors.cardHolderName" />
                  <small v-if="errors.cardHolderName" class="p-error">{{ errors.cardHolderName }}</small>
                </div>

                <div class="col-12 mb-3">
                  <label for="cardNumber" class="font-medium text-color mb-2 block">{{ t('payments.cardNumber') }}</label>
                  <pv-input-mask id="cardNumber" v-model="paymentForm.cardNumber" mask="9999-9999-9999-9999" placeholder="0000-0000-0000-0000" autocomplete="cc-number" :invalid="!!errors.cardNumber" />
                  <small v-if="errors.cardNumber" class="p-error">{{ errors.cardNumber }}</small>
                </div>

                <div class="col-6 mb-3">
                  <label for="expirationDate" class="font-medium text-color mb-2 block">{{ t('guestPayment.expiration') }}</label>
                  <pv-input-mask id="expirationDate" v-model="paymentForm.expirationDate" mask="99/99" placeholder="MM/AA" autocomplete="cc-exp" :invalid="!!errors.expirationDate" />
                  <small v-if="errors.expirationDate" class="p-error">{{ errors.expirationDate }}</small>
                </div>

                <div class="col-6 mb-3">
                  <label for="cvv" class="font-medium text-color mb-2 block">{{ t('payments.cvv') }}</label>
                  <pv-input-mask id="cvv" v-model="paymentForm.cvv" mask="999?9" placeholder="123" autocomplete="cc-csc" :invalid="!!errors.cvv" />
                  <small v-if="errors.cvv" class="p-error">{{ errors.cvv }}</small>
                </div>

                <div class="col-12 mt-3">
                  <pv-button type="submit" :label="t('payments.payNow')" icon="pi pi-check-circle" class="w-full p-button-lg font-bold" :loading="paymentStore.loading" />
                  <p class="text-xs text-color-secondary text-center mt-3">
                    <i class="pi pi-info-circle"></i> {{ t('guestPayment.simulationNote') }}
                  </p>
                </div>
              </form>
            </template>
          </pv-card>
        </div>

        <div class="col-12 lg:col-5">
          <div class="surface-card shadow-2 border-round-xl p-4">
            <h2 class="text-xl font-bold text-color mt-0 mb-4 border-bottom-1 surface-border pb-3">{{ t('guestPayment.summary') }}</h2>

            <div class="flex justify-content-between mb-3">
              <span class="text-color-secondary">{{ t('guestPayment.booking') }}</span>
              <span class="font-medium text-color">#{{ booking.id }}</span>
            </div>
            <div v-if="room" class="flex justify-content-between mb-3">
              <span class="text-color-secondary">{{ t('guestPayment.room') }}</span>
              <span class="font-medium text-color">{{ room.roomTypeName }}</span>
            </div>
            <div class="flex justify-content-between mb-3">
              <span class="text-color-secondary">{{ t('guestPayment.stay') }}</span>
              <span class="font-medium text-color">{{ formatDay(booking.checkInDate, locale) }} – {{ formatDay(booking.checkOutDate, locale) }}</span>
            </div>
            <div class="flex justify-content-between mb-3">
              <span class="text-color-secondary">{{ t('bookings.nights') }}</span>
              <span class="font-medium text-color">{{ booking.nights }}</span>
            </div>
            <div v-if="room" class="flex justify-content-between mb-3">
              <span class="text-color-secondary">{{ t('guestPayment.pricePerNight') }}</span>
              <span class="font-medium text-color">{{ formatMoney(room.price, locale) }}</span>
            </div>

            <div class="border-top-1 surface-border my-3"></div>

            <div class="flex justify-content-between align-items-center">
              <span class="text-xl font-bold text-color">{{ t('guestPayment.estimatedTotal') }}</span>
              <span class="text-2xl font-bold text-primary">{{ room ? formatMoney(estimatedTotal, locale) : t('common.notAvailable') }}</span>
            </div>
            <small class="block mt-2 text-color-secondary">{{ t('guestPayment.serverComputes') }}</small>
          </div>
        </div>
      </div>

      <div v-else class="text-center p-8 surface-card border-round-xl shadow-1">
        <i class="pi pi-search text-500 text-6xl mb-3"></i>
        <p class="text-xl text-color font-medium">{{ t('guestBookingDetail.bookingNotFound') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePaymentStore } from '../../application/payment.store.js';
import { PayBookingCommand } from '../../domain/commands/pay-booking.command.js';
import { useBookingStore } from '@/bookings/application/booking.store.js';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { formatDateTime, formatDay, formatMoney } from '@/shared/presentation/utils/formatters.js';
import { apiErrorKey } from '@/shared/presentation/utils/api-error.js';

/**
 * Pay a pending booking (simulated card).
 * The backend computes the amount (room price per night × nights) and returns it in the payment;
 * the summary only shows an estimate from the real room price, never a made-up rate.
 */
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const paymentStore = usePaymentStore();
const bookingStore = useBookingStore();
const roomStore = useRoomStore();

const bookingId = Number(route.params.bookingId);
const loadingData = ref(true);
const booking = ref(null);
const room = ref(null);
const payment = ref(null);
const errors = ref({});
const errorMessage = ref('');

const paymentForm = reactive({ cardHolderName: '', cardNumber: '', expirationDate: '', cvv: '' });

/** Same formula as the backend, for information only (the charged amount comes in the response). */
const estimatedTotal = computed(() => (room.value && booking.value ? room.value.price * booking.value.nights : 0));

onMounted(async () => {
  try {
    const [existingPayment, loadedBooking] = await Promise.all([
      paymentStore.fetchPaymentByBooking(bookingId),
      bookingStore.fetchBookingById(bookingId),
    ]);
    payment.value = existingPayment;
    booking.value = loadedBooking;
    if (loadedBooking) {
      await roomStore.fetchRoomById(loadedBooking.roomId);
      room.value = roomStore.currentRoom;
    }
  } catch (err) {
    errorMessage.value = t(apiErrorKey(err));
  } finally {
    loadingData.value = false;
  }
});

const goBack = () => router.push({ name: 'guest-booking-detail', params: { bookingId } });

async function submitPayment() {
  errorMessage.value = '';
  const command = new PayBookingCommand({ bookingId, ...paymentForm });
  const ruleErrors = command.validate();
  errors.value = Object.fromEntries(Object.entries(ruleErrors).map(([field, rule]) => [field, t(`guestPayment.rules.${rule}`)]));
  if (Object.keys(ruleErrors).length > 0) return;

  try {
    payment.value = await paymentStore.payBooking(command);
    if (payment.value.isCompleted()) {
      // The booking is Confirmed now (same transaction in the backend).
      bookingStore.fetchBookingById(bookingId);
    }
  } catch (err) {
    errorMessage.value = t(apiErrorKey(err, {
      400: 'guestPayment.invalidCard',
      404: 'guestBookingDetail.bookingNotFound',
      409: 'guestPayment.notPayable',
    }));
  }
}
</script>

