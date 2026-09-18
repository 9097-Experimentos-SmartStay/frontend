<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog />

    <div class="w-full max-w-5xl mx-auto">
      <div class="flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="router.push({ name: 'guest-bookings' })" />
          <h1 class="text-3xl font-bold text-color m-0">{{ booking ? t('guestBookingDetail.title', { code: booking.reference }) : t('guestBookingDetail.titleLoading') }}</h1>
        </div>
        <LanguageSwitcher />
      </div>

      <div v-if="loading" class="flex justify-content-center p-8"><pv-progress-spinner /></div>

      <div v-else-if="!booking" class="text-center p-8 surface-card border-round-xl shadow-1">
        <i class="pi pi-search text-500 text-5xl mb-3"></i>
        <p class="text-xl text-color font-medium">{{ t('guestBookingDetail.bookingNotFound') }}</p>
        <pv-button :label="t('guestBookingDetail.backToList')" class="p-button-text" @click="router.push({ name: 'guest-bookings' })" />
      </div>

      <template v-else>
        <!-- US-51 scenario 2: the booking was just created -->
        <pv-message v-if="justCreated" severity="success" class="mb-4">
          {{ t('guestBookingDetail.created', { code: booking.reference, email: booking.guestEmail }) }}
        </pv-message>

        <div class="grid">
          <div class="col-12 lg:col-7">
            <div class="surface-card shadow-2 border-round-xl p-4 h-full">
              <PaymentInstructions v-if="booking.isPending()" :booking="booking" />

              <template v-else-if="booking.isConfirmed()">
                <h3 class="text-lg font-bold mt-0 mb-2"><i class="pi pi-check-circle text-green-500 mr-2"></i>{{ t('guestBookingDetail.confirmedTitle') }}</h3>
                <p class="text-color-secondary mt-0">{{ t('guestBookingDetail.confirmedMessage') }}</p>
                <PaymentSummary v-if="payment" :payment="payment" />
              </template>

              <template v-else-if="booking.isCancelled()">
                <h3 class="text-lg font-bold mt-0 mb-2">{{ booking.isExpired ? t('guestBookingDetail.expiredTitle') : t('guestBookingDetail.cancelledTitle') }}</h3>
                <p class="text-color-secondary mt-0">{{ cancellationReasonText(t, booking) }}</p>
                <p v-if="booking.cancelledAt" class="text-color-secondary">{{ t('guestBookingDetail.cancelledAt', { time: formatDateTime(booking.cancelledAt, locale) }) }}</p>
                <template v-if="payment">
                  <h4 class="mb-2">{{ t('guestBookingDetail.payment') }}</h4>
                  <PaymentSummary :payment="payment" />
                </template>
              </template>

              <p v-else class="text-color-secondary m-0">{{ t('guestBookingDetail.enjoy') }}</p>
            </div>
          </div>

          <div class="col-12 lg:col-5">
            <div class="surface-card shadow-2 border-round-xl p-4">
              <div class="flex justify-content-between align-items-center mb-3">
                <span class="text-color-secondary">{{ t('guestPayment.bookingCode') }}</span>
                <span class="font-bold text-primary text-xl">{{ booking.reference }}</span>
              </div>
              <div class="flex justify-content-between align-items-center mb-3">
                <span class="text-color-secondary">{{ t('bookings.status') }}</span>
                <BookingStatusTag :booking="booking" />
              </div>
              <div class="flex justify-content-between mb-3">
                <span class="text-color-secondary">{{ t('guestSearch.hotel') }}</span>
                <span class="font-medium text-right">{{ hotelName }}</span>
              </div>
              <div class="flex justify-content-between mb-3">
                <span class="text-color-secondary">{{ t('guestBookings.room') }}</span>
                <span class="font-medium">{{ booking.roomLabel }}</span>
              </div>
              <div class="flex justify-content-between mb-3">
                <span class="text-color-secondary">{{ t('stay.checkIn') }}</span>
                <span class="font-medium">{{ formatDay(booking.checkInDate, locale, 'medium') }}</span>
              </div>
              <div class="flex justify-content-between mb-3">
                <span class="text-color-secondary">{{ t('stay.checkOut') }}</span>
                <span class="font-medium">{{ formatDay(booking.checkOutDate, locale, 'medium') }}</span>
              </div>
              <div class="flex justify-content-between mb-3">
                <span class="text-color-secondary">{{ t('guestPayment.pricePerNight') }}</span>
                <span class="font-medium">{{ formatMoney(booking.pricePerNight, locale) }} × {{ booking.nights }}</span>
              </div>
              <div class="border-top-1 surface-border my-3"></div>
              <div class="flex justify-content-between align-items-center">
                <span class="text-xl font-bold">{{ t('guestSearch.total') }}</span>
                <span class="text-2xl font-bold text-primary">{{ formatMoney(booking.total, locale) }}</span>
              </div>

              <template v-if="booking.isPending() || booking.isConfirmed()">
                <div class="border-top-1 surface-border my-3"></div>
                <pv-button
                    :label="t('guestBookings.cancelBooking')"
                    icon="pi pi-times"
                    class="p-button-danger p-button-outlined w-full"
                    :disabled="!booking.canBeCancelled()"
                    @click="confirmCancel(booking, reloadPayment)"
                />
                <small class="block mt-2 text-color-secondary">
                  {{ booking.canBeCancelled() ? t('guestBookingDetail.cancelPolicy') : cancellationBlockText(t, booking, locale) }}
                </small>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';
import BookingStatusTag from '../components/BookingStatusTag.vue';
import { useBookingCancellation } from '../composables/use-booking-cancellation.js';
import { cancellationBlockText, cancellationReasonText } from '../utils/booking-status.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { usePaymentStore } from '@/payments/application/payment.store.js';
import PaymentInstructions from '@/payments/presentation/components/PaymentInstructions.vue';
import PaymentSummary from '@/payments/presentation/components/PaymentSummary.vue';
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue';
import { formatDateTime, formatDay, formatMoney } from '@/shared/presentation/utils/formatters.js';

/**
 * A booking of the guest (US-51): code, status, room, stay and total; how and until when to pay while it is
 * Pending; the registered payment once confirmed (or refunded after a cancellation); cancel with the policy.
 */
const props = defineProps({
  bookingId: { type: [String, Number], required: true },
});

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const bookingStore = useBookingStore();
const hotelStore = useHotelStore();
const paymentStore = usePaymentStore();
const { confirmCancel } = useBookingCancellation();

const loading = ref(true);
const payment = ref(null);
const justCreated = computed(() => route.query.created === '1');
const booking = computed(() => (bookingStore.currentBooking?.id === Number(props.bookingId) ? bookingStore.currentBooking : null));
const hotelName = computed(() => hotelStore.hotels.find((hotel) => hotel.id === booking.value?.hotelId)?.name ?? '');

async function reloadPayment() {
  payment.value = booking.value && !booking.value.isPending()
    ? await paymentStore.fetchPaymentByBooking(booking.value.id)
    : null;
}

onMounted(async () => {
  // GET /bookings/{id}: 404 when it does not exist or is not the guest's.
  await Promise.all([bookingStore.fetchBookingById(Number(props.bookingId)), hotelStore.fetchAllHotels()]);
  await reloadPayment();
  loading.value = false;
});
</script>
