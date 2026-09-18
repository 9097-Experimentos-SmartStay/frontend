<template>
  <div class="p-4 md:p-6 w-full max-w-7xl mx-auto">
    <pv-toast position="bottom-right" />

    <EmailVerificationBanner />

    <div v-if="loading" class="flex flex-column align-items-center justify-content-center h-20rem">
      <pv-progress-spinner />
      <p class="mt-3 text-gray-500">{{ $t('common.loading') }}</p>
    </div>

    <div v-else>
      <div class="surface-card p-5 shadow-2 border-round-2xl mb-5 relative overflow-hidden">
        <div class="relative z-2">
          <h1 class="text-4xl font-bold text-900 mb-2">{{ $t('guestDashboard.title', { name: currentUser?.firstName || currentUser?.displayName }) }} 👋</h1>
          <p class="text-lg text-600 m-0 max-w-30rem">{{ $t('guestDashboard.subtitle') }}</p>
        </div>
        <i class="pi pi-star-fill absolute text-yellow-100" style="font-size: 15rem; right: -3rem; bottom: -5rem; z-index: 1; opacity: 0.5;"></i>
      </div>

      <div class="grid">
        <div class="col-12 lg:col-8">

          <div class="mb-5">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-xl font-bold text-900 flex align-items-center gap-2">
                <i class="pi pi-compass text-primary"></i> {{ $t('guestDashboard.nextDestination') }}
              </span>
              <pv-button :label="$t('guestDashboard.viewAll')" icon="pi pi-arrow-right" iconPos="right" class="p-button-text p-button-sm" @click="goToBookings" />
            </div>

            <pv-card v-if="upcomingBookings.length > 0" class="border-left-3 border-primary surface-card shadow-4 border-round-xl">
              <template #content>
                <div class="flex flex-column md:flex-row gap-4">
                  <div class="w-full md:w-4 border-round-lg overflow-hidden bg-gray-100 flex align-items-center justify-content-center min-h-10rem">
                    <i class="pi pi-image text-5xl text-gray-300"></i>
                  </div>

                  <div class="flex-1 flex flex-column justify-content-between">
                    <div>
                      <div class="flex justify-content-between align-items-start mb-2">
                        <h2 class="text-2xl font-bold m-0 text-900">{{ $t('guestDashboard.roomNumber', { id: upcomingBookings[0].roomLabel }) }}</h2>
                        <BookingStatusTag :booking="upcomingBookings[0]" />
                      </div>
                      <div class="text-500 flex align-items-center gap-2">
                        <i class="pi pi-map-marker text-primary"></i> {{ hotelLabelFor(upcomingBookings[0]) }}
                      </div>
                    </div>

                    <div class="grid mt-4">
                      <div class="col-6 border-right-1 border-100">
                        <span class="text-xs text-500 uppercase font-bold block mb-1">{{ $t('bookings.checkIn') }}</span>
                        <span class="text-xl font-medium text-900">{{ formatDay(upcomingBookings[0].checkInDate, locale, 'medium') }}</span>
                      </div>
                      <div class="col-6 pl-3">
                        <span class="text-xs text-500 uppercase font-bold block mb-1">{{ $t('bookings.checkOut') }}</span>
                        <span class="text-xl font-medium text-900">{{ formatDay(upcomingBookings[0].checkOutDate, locale, 'medium') }}</span>
                      </div>
                    </div>

                    <div class="flex justify-content-end gap-2 mt-4 pt-3 border-top-1 border-100">
                      <pv-button v-if="upcomingBookings[0].canBeCancelled()" :label="$t('common.cancel')" class="p-button-danger p-button-text p-button-sm" icon="pi pi-times" @click="cancelBooking(upcomingBookings[0])" />
                      <pv-button :label="$t('guestDashboard.manageBooking')" class="p-button-sm" icon="pi pi-cog" @click="openBooking(upcomingBookings[0])" />
                    </div>
                  </div>
                </div>
              </template>
            </pv-card>

            <div v-else class="surface-card p-6 text-center border-round-xl shadow-1 border-dashed border-1 border-300">
              <div class="bg-blue-50 border-circle w-4rem h-4rem flex align-items-center justify-content-center mx-auto mb-3">
                <i class="pi pi-calendar-plus text-2xl text-blue-500"></i>
              </div>
              <h3 class="text-900 font-medium m-0 mb-2">{{ $t('guestDashboard.noUpcoming') }}</h3>
              <p class="text-600 mb-4 max-w-20rem mx-auto">{{ $t('guestDashboard.exploreHotels') }}</p>
              <pv-button :label="$t('guestDashboard.searchRooms')" icon="pi pi-search" @click="goToRooms" />
            </div>
          </div>

          <div>
            <span class="text-xl font-bold text-900 block mb-3">{{ $t('guestDashboard.recommendationsTitle') }}</span>
            <div v-if="recommendations.length" class="grid">
              <div v-for="room in recommendations" :key="room.id" class="col-12 md:col-6">
                <button
                    type="button"
                    class="recommendation-card w-full text-left border-1 surface-border border-round-xl p-3 hover:shadow-4 transition-duration-300 cursor-pointer bg-white h-full flex flex-column"
                    @click="goToRoom(room.id)"
                >
                  <span class="relative w-full block">
                    <span class="bg-gray-100 border-round-lg h-10rem w-full flex align-items-center justify-content-center mb-3">
                      <i class="pi pi-home text-4xl text-gray-300" aria-hidden="true"></i>
                    </span>
                    <pv-tag :value="formatMoney(room.price, locale)" severity="warn" class="absolute shadow-1" style="top: 10px; left: 10px" />
                  </span>
                  <span class="flex-1 block">
                    <span class="font-bold text-lg mb-2 text-900 block">{{ room.roomTypeName }}</span>
                    <span class="text-600 text-sm line-height-3 block text-overflow-ellipsis overflow-hidden h-3rem">{{ room.description }}</span>
                  </span>
                  <span class="mt-3 pt-3 border-top-1 border-100 flex align-items-center justify-content-between w-full">
                    <span class="text-primary font-bold text-sm">{{ $t('accommodations.viewDetails') }}</span>
                    <i class="pi pi-arrow-right text-primary" aria-hidden="true"></i>
                  </span>
                </button>
              </div>
            </div>
            <p v-else class="text-600 m-0">{{ $t('guestDashboard.noRecommendations') }}</p>
          </div>
        </div>

        <div class="col-12 lg:col-4">
          <div class="grid mb-4">
            <div class="col-6">
              <div class="surface-card shadow-1 p-3 border-round-xl text-center h-full flex flex-column justify-content-center">
                <span class="block text-500 font-medium text-sm mb-1">{{ $t('guestDashboard.myBookings') }}</span>
                <div class="text-900 font-bold text-3xl text-primary">{{ stats.upcoming }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="surface-card shadow-1 p-3 border-round-xl text-center h-full flex flex-column justify-content-center">
                <span class="block text-500 font-medium text-sm mb-1">{{ $t('bookings.nights') }}</span>
                <div class="text-900 font-bold text-3xl text-orange-500">{{ stats.nights || 0 }}</div>
              </div>
            </div>
          </div>

          <pv-card class="mb-4 shadow-1 border-round-xl">
            <template #title><div class="text-lg font-bold">{{ $t('guestDashboard.quickServices') }}</div></template>
            <template #content>
              <ul class="list-none p-0 m-0">
                <li class="flex align-items-center py-3 border-bottom-1 surface-border cursor-pointer hover:bg-gray-50 px-2 border-round transition-duration-200" @click="goToRooms">
                  <div class="flex align-items-center justify-content-center bg-blue-100 border-round mr-3" style="width: 2.5rem; height: 2.5rem"><i class="pi pi-search text-blue-600 text-lg"></i></div>
                  <span class="text-800 font-medium">{{ $t('guestDashboard.newBooking') }}</span>
                  <i class="pi pi-angle-right text-400 ml-auto"></i>
                </li>
                <li class="flex align-items-center py-3 cursor-pointer hover:bg-gray-50 px-2 border-round transition-duration-200" @click="goToHotels">
                  <div class="flex align-items-center justify-content-center bg-purple-100 border-round mr-3" style="width: 2.5rem; height: 2.5rem"><i class="pi pi-map text-purple-600 text-lg"></i></div>
                  <span class="text-800 font-medium">{{ $t('guestDashboard.viewHotels') }}</span>
                  <i class="pi pi-angle-right text-400 ml-auto"></i>
                </li>
              </ul>
            </template>
          </pv-card>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reportError } from '@/shared/infrastructure/logging/report-error.js';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';

import useIamStore from '@/iam/application/iam.store.js';
import EmailVerificationBanner from '@/iam/presentation/components/email-verification-banner.vue';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { useBookingStore } from '@/bookings/application/booking.store.js';
import BookingStatusTag from '@/bookings/presentation/components/BookingStatusTag.vue';
import { formatDay, formatMoney } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/**
 * Guest area home. The signed-in user comes from the session (GET /users is admin-only),
 * and GET /bookings already returns only the guest's own bookings.
 */
const router = useRouter();
const toast = useToast();
const { t, locale } = useI18n();

const iamStore = useIamStore();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();
const bookingStore = useBookingStore();

const loading = ref(true);
const recommendations = ref([]);

const currentUser = computed(() => iamStore.currentUser);

/** Active bookings not finished yet, nearest first. */
const upcomingBookings = computed(() => bookingStore.bookings
    .filter((booking) => booking.isUpcoming())
    .sort((a, b) => a.checkInDate.daysUntil(b.checkInDate) * -1));

const stats = computed(() => ({
  upcoming: upcomingBookings.value.length,
  nights: bookingStore.bookings.filter((booking) => booking.isActive()).reduce((sum, booking) => sum + booking.nights, 0),
}));

/** Hotel of the booked room (Room → Hotel), instead of a made-up name. */
function hotelLabelFor(booking) {
  const hotel = hotelStore.hotels.find((h) => h.id === booking.hotelId);
  return hotel ? `${hotel.name} · ${hotel.location}` : t('common.notAvailable');
}

async function loadDashboard() {
  loading.value = true;
  try {
    await Promise.all([
      bookingStore.fetchBookings(),
      roomStore.fetchAllRooms(),
      hotelStore.fetchAllHotels()
    ]);
    recommendations.value = recommendRooms(roomStore.rooms, bookingStore.bookings);
  } catch (err) {
    reportError('Error loading dashboard', err);
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('guestDashboard.loadError'), life: 4000 });
  } finally {
    loading.value = false;
  }
}

/**
 * Up to four rooms the guest has not booked, one per hotel and room type, so no two cards look the same.
 * @param {Array} rooms
 * @param {Array} bookings
 */
function recommendRooms(rooms, bookings) {
  const bookedRoomIds = new Set(bookings.map((booking) => booking.roomId));
  const seen = new Set();
  const picked = [];
  for (const room of rooms) {
    const kind = `${room.hotelId}:${room.roomTypeId ?? room.roomTypeName}`;
    if (bookedRoomIds.has(room.id) || seen.has(kind)) continue;
    seen.add(kind);
    picked.push(room);
    if (picked.length === 4) break;
  }
  return picked;
}

function goToRooms() { router.push({ name: 'guest-rooms' }); }
function goToHotels() { router.push({ name: 'guest-hotels' }); }
function goToBookings() { router.push({ name: 'guest-bookings' }); }
function goToRoom(roomId) { router.push({ name: 'guest-room-detail', params: { roomId } }); }

async function cancelBooking(booking) {
  try {
    await bookingStore.cancelBooking(booking.id);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('bookings.bookingCancelled'), life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t(failureMessageKey(err, { checkInDayReached: 'bookingCancellation.checkInDayReachedError', notChangeable: 'bookingCancellation.notCancellable' })), life: 5000 });
  }
}

function openBooking(booking) {
  router.push({ name: 'guest-booking-detail', params: { bookingId: booking.id } });
}

onMounted(loadDashboard);
</script>

<style scoped>
.recommendation-card {
  font: inherit;
  color: inherit;
}

.transition-duration-300 { transition-duration: 300ms; }
.hover\:shadow-4:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
</style>
