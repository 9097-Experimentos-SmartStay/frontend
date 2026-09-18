<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-6xl mx-auto">
      <div class="flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="router.push({ name: 'guest-bookings' })" />
          <h1 class="text-3xl font-bold text-color m-0">{{ t('guestSearch.title') }}</h1>
        </div>
        <LanguageSwitcher />
      </div>

      <!-- Scenario 1 and 4: hotel + dates, validated before searching -->
      <pv-card class="shadow-2 border-round-xl mb-4">
        <template #content>
          <form novalidate @submit.prevent="search">
            <div class="grid formgrid p-fluid">
              <div class="col-12 lg:col-4 field">
                <label for="search-hotel" class="font-medium block mb-2">{{ t('guestSearch.hotel') }} *</label>
                <pv-select
                    v-model="hotelId"
                    input-id="search-hotel"
                    :options="hotelStore.hotels"
                    option-label="name"
                    option-value="id"
                    :placeholder="t('guestSearch.hotelPlaceholder')"
                    :invalid="!!hotelError"
                    filter
                    fluid
                >
                  <template #option="{ option }">
                    <div class="flex align-items-center justify-content-between gap-2 w-full">
                      <span>{{ option.name }}</span>
                      <pv-tag v-if="!option.acceptsBookings" :value="t('guestSearch.hotelNotAcceptingBadge')" severity="warn" />
                    </div>
                  </template>
                </pv-select>
                <small v-if="hotelError" class="p-error">{{ hotelError }}</small>
              </div>
              <div class="col-12 lg:col-8">
                <StayPicker v-model:stay="stay" :error="stayError" id-prefix="search" />
              </div>
            </div>
            <div class="flex justify-content-end">
              <pv-button type="submit" :label="t('guestSearch.search')" icon="pi pi-search" :loading="bookingStore.searching" />
            </div>
          </form>
        </template>
      </pv-card>

      <!-- A hotel without payment methods does not accept bookings (409 booking.hotel_payment_settings_missing) -->
      <pv-message v-if="hotelNotAccepting" severity="warn" class="mb-3">{{ t('guestSearch.hotelNotAccepting') }}</pv-message>
      <pv-message v-if="searchError" severity="error" class="mb-3">{{ searchError }}</pv-message>

      <!-- Results: only rooms free for the whole stay, with price per night and total -->
      <template v-if="searched && !bookingStore.searching && !hotelNotAccepting">
        <p class="text-color-secondary mb-3">
          {{ t('guestSearch.results', { count: results.length, nights: stay.nights }, results.length) }}
        </p>

        <div v-if="results.length" class="grid">
          <div v-for="room in results" :key="room.roomId" class="col-12 md:col-6 lg:col-4">
            <div class="surface-card shadow-2 border-round-xl p-4 h-full flex flex-column" :class="{ 'border-2 border-primary': room.roomId === highlightedRoomId }">
              <div class="flex justify-content-between align-items-start mb-2">
                <div>
                  <h2 class="text-xl font-bold m-0">{{ t('guestRooms.roomNumber', { number: room.label }) }}</h2>
                  <pv-tag :value="room.roomTypeName" severity="info" class="mt-2" />
                </div>
                <div class="text-right">
                  <div class="text-xs text-500">{{ t('hotels.pricePerNight') }}</div>
                  <div class="font-bold">{{ formatMoney(room.pricePerNight, locale) }}</div>
                </div>
              </div>
              <p class="text-color-secondary text-sm line-height-3 mb-3">{{ room.description }}</p>
              <div class="flex gap-2 flex-wrap mb-3">
                <span v-for="amenity in room.amenities.slice(0, 4)" :key="amenity" class="surface-100 text-600 border-round px-2 py-1 text-xs">{{ amenity }}</span>
              </div>
              <div class="mt-auto border-top-1 surface-border pt-3 flex justify-content-between align-items-center">
                <div>
                  <div class="text-xs text-500">{{ t('guestSearch.totalFor', { count: room.nights }, room.nights) }}</div>
                  <div class="text-2xl font-bold text-primary">{{ formatMoney(room.total, locale) }}</div>
                </div>
                <pv-button :label="t('guestSearch.book')" icon="pi pi-calendar-plus" @click="openConfirmation(room)" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="surface-card p-5 border-round-xl text-center">
          <i class="pi pi-calendar-times text-5xl text-500 mb-3"></i>
          <p class="text-color font-medium m-0">{{ t('guestSearch.noResults') }}</p>
        </div>
      </template>
    </div>

    <!-- Scenario 2: confirm → Pending booking with a code; scenario 3: 409 → search again -->
    <pv-dialog v-model:visible="confirmation.visible" modal :header="t('guestSearch.confirmTitle')" :style="{ width: '32rem' }" :breakpoints="{ '640px': '95vw' }">
      <template v-if="confirmation.room">
        <dl class="summary">
          <div><dt>{{ t('guestSearch.hotel') }}</dt><dd>{{ hotelName(confirmation.room.hotelId) }}</dd></div>
          <div><dt>{{ t('guestBookings.room') }}</dt><dd>{{ confirmation.room.label }} · {{ confirmation.room.roomTypeName }}</dd></div>
          <div><dt>{{ t('stay.checkIn') }}</dt><dd>{{ formatDay(confirmation.room.stay.checkIn, locale, 'medium') }}</dd></div>
          <div><dt>{{ t('stay.checkOut') }}</dt><dd>{{ formatDay(confirmation.room.stay.checkOut, locale, 'medium') }}</dd></div>
          <div><dt>{{ t('hotels.pricePerNight') }}</dt><dd>{{ formatMoney(confirmation.room.pricePerNight, locale) }} × {{ confirmation.room.nights }}</dd></div>
          <div><dt>{{ t('guestSearch.total') }}</dt><dd class="text-xl font-bold text-primary">{{ formatMoney(confirmation.room.total, locale) }}</dd></div>
        </dl>
        <pv-message severity="info" class="mt-3">{{ t('guestSearch.pendingNote') }}</pv-message>

        <pv-message v-if="confirmation.unavailable" severity="error" class="mt-3">
          {{ t('guestSearch.noLongerAvailable') }}
          <pv-button :label="t('guestSearch.searchAgain')" icon="pi pi-refresh" class="p-button-sm mt-2 block" @click="searchAgain" />
        </pv-message>
        <pv-message v-else-if="confirmation.error" severity="error" class="mt-3">{{ confirmation.error }}</pv-message>
      </template>

      <template #footer>
        <pv-button :label="t('common.cancel')" class="p-button-text" @click="confirmation.visible = false" />
        <pv-button
            :label="t('guestSearch.confirm')"
            icon="pi pi-check"
            :loading="bookingStore.saving"
            :disabled="confirmation.unavailable"
            @click="book"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';
import { BookingFailureReason } from '../../application/booking-failure.js';
import { SearchAvailabilityQuery } from '../../domain/commands/search-availability.query.js';
import { CreateBookingCommand } from '../../domain/commands/create-booking.command.js';
import { StayPeriod } from '../../domain/model/stay-period.js';
import StayPicker from '../components/StayPicker.vue';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue';
import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { formatDay, formatMoney } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/**
 * US-51: the guest searches rooms of a hotel free for the whole stay (price per night and total), books one
 * (Pending, with a code and a 24-hour payment deadline) and, if someone took it meanwhile (409), searches again.
 * `?hotelId=&roomId=` preselect the hotel and highlight a room (from the room detail).
 */
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const bookingStore = useBookingStore();
const hotelStore = useHotelStore();

const hotelId = ref(route.query.hotelId ? Number(route.query.hotelId) : null);
const highlightedRoomId = route.query.roomId ? Number(route.query.roomId) : null;
const stay = ref(new StayPeriod(CalendarDate.from(route.query.checkIn), CalendarDate.from(route.query.checkOut)));
const hotelError = ref('');
const stayError = ref('');
const searchError = ref('');
const searched = ref(false);
const confirmation = reactive({ visible: false, room: null, unavailable: false, error: '' });

/** The highlighted room first, then the order of the API (hotel, price). */
const results = computed(() => [...bookingStore.availableRooms].sort((a, b) => (b.roomId === highlightedRoomId) - (a.roomId === highlightedRoomId)));

const hotelName = (id) => hotelStore.hotels.find((hotel) => hotel.id === id)?.name ?? '';
const selectedHotel = computed(() => hotelStore.hotels.find((hotel) => hotel.id === hotelId.value) ?? null);
/** The selected hotel has no payment methods yet: nothing can be booked there. */
const hotelNotAccepting = computed(() => selectedHotel.value?.acceptsBookings === false);

async function search() {
  searchError.value = '';
  hotelError.value = hotelId.value ? '' : t('guestSearch.hotelRequired');
  const query = new SearchAvailabilityQuery({ hotelId: hotelId.value, stay: stay.value });
  const rule = query.validate();
  stayError.value = rule ? t(`stayRules.${rule}`) : '';
  if (rule || hotelError.value || hotelNotAccepting.value) return;

  try {
    await bookingStore.searchAvailability(query);
    searched.value = true;
    router.replace({ query: { ...route.query, hotelId: hotelId.value, checkIn: stay.value.checkIn.toIsoString(), checkOut: stay.value.checkOut.toIsoString() } });
  } catch (failure) {
    searched.value = false;
    if (failure.fieldViolations?.stay) stayError.value = t(`stayRules.${failure.fieldViolations.stay.code}`);
    else searchError.value = t(failureMessageKey(failure));
  }
}

function openConfirmation(room) {
  Object.assign(confirmation, { visible: true, room, unavailable: false, error: '' });
}

async function book() {
  confirmation.error = '';
  const command = new CreateBookingCommand({ roomId: confirmation.room.roomId, stay: confirmation.room.stay });
  const violations = command.validate();
  if (violations.stay) {
    confirmation.error = t(`stayRules.${violations.stay.code}`);
    return;
  }
  try {
    const booking = await bookingStore.createBooking(command);
    confirmation.visible = false;
    await router.push({ name: 'guest-booking-detail', params: { bookingId: booking.id }, query: { created: '1' } });
  } catch (failure) {
    if (failure.reason === BookingFailureReason.ROOM_UNAVAILABLE) confirmation.unavailable = true;
    else if (failure.reason === BookingFailureReason.HOTEL_NOT_ACCEPTING_BOOKINGS) confirmation.error = t('guestSearch.hotelNotAccepting');
    else if (failure.fieldViolations?.stay) confirmation.error = t(`stayRules.${failure.fieldViolations.stay.code}`);
    else confirmation.error = t(failureMessageKey(failure));
  }
}

/** Scenario 3: the room was taken meanwhile; the same search shows what is still free. */
async function searchAgain() {
  confirmation.visible = false;
  await search();
}

onMounted(async () => {
  await hotelStore.fetchAllHotels();
  if (hotelId.value && stay.value.isComplete && !stay.value.validate()) await search();
});
</script>

<style scoped>
.summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1.5rem;
  margin: 0;
}
.summary dt {
  font-size: 0.8rem;
  color: #64748b;
}
.summary dd {
  margin: 0;
  font-weight: 500;
}
</style>
