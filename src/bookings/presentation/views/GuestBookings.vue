<template>
  <div class="p-4 md:p-6">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog />

    <div class="w-full max-w-5xl mx-auto">
      <div class="flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="router.push({ name: 'guest-dashboard' })" />
          <h1 class="text-3xl font-bold text-color m-0">{{ t('guestBookings.title') }}</h1>
        </div>
        <div class="flex align-items-center gap-2">
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" :aria-label="t('common.refresh')" v-tooltip="t('common.refresh')" @click="load" />
          <pv-button :label="t('guestBookings.newBooking')" icon="pi pi-plus" @click="router.push({ name: 'guest-create-booking' })" />
        </div>
      </div>

      <div v-if="bookingStore.loading && !bookingStore.bookings.length" class="flex justify-content-center p-8"><pv-progress-spinner /></div>

      <pv-message v-else-if="bookingStore.error" severity="error">{{ t(failureMessageKey(bookingStore.error)) }}</pv-message>

      <div v-else-if="bookingStore.bookings.length" class="flex flex-column gap-3">
        <article v-for="booking in bookingStore.bookings" :key="booking.id" class="surface-card shadow-1 border-round-xl p-4">
          <div class="flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              <div class="flex align-items-center gap-2 mb-1">
                <span class="text-xl font-bold text-primary">{{ booking.reference }}</span>
                <BookingStatusTag :booking="booking" />
              </div>
              <div class="text-color font-medium">{{ hotelName(booking.hotelId) }} · {{ t('guestRooms.roomNumber', { number: booking.roomLabel }) }}</div>
              <div class="text-color-secondary">
                {{ formatDay(booking.checkInDate, locale, 'medium') }} → {{ formatDay(booking.checkOutDate, locale, 'medium') }}
                · {{ t('stay.nights', { count: booking.nights }, booking.nights) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-500">{{ t('guestSearch.total') }}</div>
              <div class="text-2xl font-bold">{{ formatMoney(booking.total, locale) }}</div>
            </div>
          </div>

          <PaymentDeadline v-if="booking.isPending()" :booking="booking" class="mt-3" />
          <small v-if="booking.isCancelled()" class="block mt-2 text-color-secondary">{{ cancellationReasonText(t, booking) }}</small>

          <div class="flex flex-wrap justify-content-end gap-2 mt-3">
            <pv-button
                v-if="booking.isPending() || booking.isConfirmed()"
                :label="t('guestBookings.cancelBooking')"
                icon="pi pi-times"
                class="p-button-danger p-button-text p-button-sm"
                :disabled="!booking.canBeCancelled()"
                @click="confirmCancel(booking)"
            />
            <pv-button :label="booking.isPending() ? t('guestBookings.howToPay') : t('guestBookings.viewDetails')" icon="pi pi-arrow-right" icon-pos="right" class="p-button-sm p-button-outlined" @click="openBooking(booking)" />
          </div>
          <small v-if="(booking.isPending() || booking.isConfirmed()) && !booking.canBeCancelled()" class="block text-right text-color-secondary mt-1">
            {{ cancellationBlockText(t, booking, locale) }}
          </small>
        </article>
      </div>

      <div v-else class="text-center p-8 surface-card border-round-xl shadow-1">
        <i class="pi pi-calendar-times text-500 text-5xl mb-3"></i>
        <h3 class="text-color font-bold m-0 mb-2">{{ t('guestBookings.noActiveBookings') }}</h3>
        <p class="text-color-secondary mb-4">{{ t('guestBookings.planningEscape') }}</p>
        <pv-button :label="t('guestBookings.newBooking')" icon="pi pi-search" @click="router.push({ name: 'guest-create-booking' })" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';
import BookingStatusTag from '../components/BookingStatusTag.vue';
import PaymentDeadline from '../components/PaymentDeadline.vue';
import { useBookingCancellation } from '../composables/use-booking-cancellation.js';
import { cancellationBlockText, cancellationReasonText } from '../utils/booking-status.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { formatDay, formatMoney } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/**
 * "Mis reservas" (US-51): code, status badge, hotel and room number, stay, total; pending bookings show the
 * payment deadline with a countdown; cancellation follows the policy (not on or after the check-in day).
 */
const router = useRouter();
const { t, locale } = useI18n();
const bookingStore = useBookingStore();
const hotelStore = useHotelStore();
const { confirmCancel } = useBookingCancellation({ byGuest: true });

const hotelName = (hotelId) => hotelStore.hotels.find((hotel) => hotel.id === hotelId)?.name ?? '';
const openBooking = (booking) => router.push({ name: 'guest-booking-detail', params: { bookingId: booking.id } });

function load() {
  return Promise.all([bookingStore.fetchBookings(), hotelStore.fetchAllHotels()]);
}

onMounted(load);
</script>
