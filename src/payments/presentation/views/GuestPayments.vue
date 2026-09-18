<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <div class="w-full max-w-5xl">
      <div class="flex align-items-center gap-3 mb-6">
        <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="goBack" />
        <h1 class="text-3xl font-bold text-color m-0">{{ t('guestPayment.title') }}</h1>
      </div>

      <div v-if="loadingData" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <div v-else-if="!booking" class="text-center p-8 surface-card border-round-xl shadow-1">
        <i class="pi pi-search text-500 text-6xl mb-3"></i>
        <p class="text-xl text-color font-medium">{{ t('guestBookingDetail.bookingNotFound') }}</p>
      </div>

      <div v-else class="grid">
        <div class="col-12 lg:col-7">
          <div class="surface-card shadow-2 border-round-xl p-4 h-full">
            <!-- Paid: reception registered the payment and the booking is confirmed -->
            <template v-if="payment?.isCompleted() || booking.isConfirmed()">
              <div class="text-center">
                <i class="pi pi-check-circle text-green-500 text-6xl mb-3"></i>
                <h2 class="text-2xl font-bold text-color mt-0">{{ t('guestPayment.paidTitle') }}</h2>
                <p class="text-color-secondary">{{ t('guestPayment.paidMessage') }}</p>
                <p v-if="payment" class="font-semibold">{{ t('guestPayment.paidAmount', { amount: formatMoney(payment.amount, locale) }) }}</p>
              </div>
            </template>

            <pv-message v-else-if="booking.isCancelled()" severity="warn">{{ t('guestPayment.cancelled') }}</pv-message>

            <!-- Pending: how to pay outside the app (no card form) -->
            <template v-else>
              <h2 class="text-xl font-bold text-color mt-0">{{ t('guestPayment.howToPay') }}</h2>
              <p class="text-color-secondary line-height-3">{{ t('guestPayment.instructionsIntro', { code: bookingCode }) }}</p>

              <ol class="pl-4 line-height-3 text-color">
                <li>{{ t('guestPayment.steps.choose') }}</li>
                <li>{{ t('guestPayment.steps.reference', { code: bookingCode }) }}</li>
                <li>{{ t('guestPayment.steps.keepReceipt') }}</li>
                <li>{{ t('guestPayment.steps.confirmation') }}</li>
              </ol>

              <div class="flex flex-wrap gap-2 my-3">
                <pv-tag v-for="method in REMOTE_PAYMENT_METHODS" :key="method" :value="t(`paymentMethods.${method}`)" severity="info" />
              </div>

              <pv-message severity="warn" class="mt-3">
                {{ t('guestPayment.deadline', { hours: PAYMENT_DEADLINE_HOURS }) }}
              </pv-message>
              <small class="block mt-2 text-color-secondary">{{ t('guestPayment.accountDetailsNote') }}</small>
            </template>
          </div>
        </div>

        <div class="col-12 lg:col-5">
          <div class="surface-card shadow-2 border-round-xl p-4">
            <h2 class="text-xl font-bold text-color mt-0 mb-4 border-bottom-1 surface-border pb-3">{{ t('guestPayment.summary') }}</h2>

            <div class="flex justify-content-between mb-3">
              <span class="text-color-secondary">{{ t('guestPayment.bookingCode') }}</span>
              <span class="font-bold text-primary text-xl">{{ bookingCode }}</span>
            </div>
            <div class="flex justify-content-between mb-3">
              <span class="text-color-secondary">{{ t('bookings.status') }}</span>
              <pv-tag :value="bookingStatusLabel(t, booking.status)" :severity="bookingStatusSeverity(booking.status)" rounded />
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
              <span class="text-xl font-bold text-color">{{ payment ? t('guestPayment.paid') : t('guestPayment.total') }}</span>
              <span class="text-2xl font-bold text-primary">{{ totalLabel }}</span>
            </div>
            <small class="block mt-2 text-color-secondary">{{ t('guestPayment.serverComputes') }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePaymentStore } from '../../application/payment.store.js';
import { PAYMENT_DEADLINE_HOURS, REMOTE_PAYMENT_METHODS } from '../../domain/model/payment-method.js';
import { useBookingStore } from '@/bookings/application/booking.store.js';
import { bookingStatusLabel, bookingStatusSeverity } from '@/bookings/presentation/utils/booking-status.js';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { formatDay, formatMoney } from '@/shared/presentation/utils/formatters.js';

/**
 * How to pay a booking. Guests do NOT pay with a card inside the app: they pay by Yape, Plin or
 * bank transfer quoting the booking code within 24 hours, and reception registers the payment,
 * which confirms the booking. The amount charged is the one the backend computes.
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

/** Code the guest quotes when paying (the API has no dedicated booking code yet: the id is used). */
const bookingCode = computed(() => `#${bookingId}`);

/** Paid amount from the backend; before payment, the room price × nights (same formula as the backend). */
const totalLabel = computed(() => {
  if (payment.value) return formatMoney(payment.value.amount, locale.value);
  if (room.value && booking.value) return formatMoney(room.value.price * booking.value.nights, locale.value);
  return t('common.notAvailable');
});

onMounted(async () => {
  const [existingPayment, loadedBooking] = await Promise.all([
    paymentStore.fetchPaymentByBooking(bookingId).catch(() => null),
    bookingStore.fetchBookingById(bookingId),
  ]);
  payment.value = existingPayment?.isCompleted() ? existingPayment : null;
  booking.value = loadedBooking;
  if (loadedBooking) {
    await roomStore.fetchRoomById(loadedBooking.roomId);
    room.value = roomStore.currentRoom;
  }
  loadingData.value = false;
});

const goBack = () => router.push({ name: 'guest-booking-detail', params: { bookingId } });
</script>
