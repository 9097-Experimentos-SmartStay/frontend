<template>
  <pv-dialog
      :visible="visible"
      modal
      :header="t('manualBooking.title')"
      :style="{ width: '46rem' }"
      :breakpoints="{ '768px': '95vw' }"
      @update:visible="emit('update:visible', $event)"
      @show="reset"
  >
    <form class="p-fluid" novalidate @submit.prevent="create">
      <h3 class="text-base font-semibold mt-0 mb-2">{{ t('manualBooking.guestSection') }}</h3>
      <div class="grid formgrid">
        <div class="col-12 md:col-6 field">
          <label for="mb-name" class="block mb-2">{{ t('manualBooking.guestName') }} *</label>
          <pv-input-text id="mb-name" v-model="form.name" autocomplete="off" :invalid="!!errors.guestName" />
          <small v-if="errors.guestName" class="p-error">{{ errors.guestName }}</small>
        </div>
        <div class="col-12 md:col-6 field">
          <label for="mb-email" class="block mb-2">{{ t('manualBooking.guestEmail') }} *</label>
          <pv-input-text id="mb-email" v-model="form.email" type="email" autocomplete="off" :invalid="!!errors.guestEmail" />
          <small v-if="errors.guestEmail" class="p-error">{{ errors.guestEmail }}</small>
          <small v-else class="text-color-secondary">{{ t('manualBooking.guestEmailHint') }}</small>
        </div>
        <div class="col-12 md:col-6 field">
          <label for="mb-phone" class="block mb-2">{{ t('manualBooking.guestPhone') }}</label>
          <pv-input-text id="mb-phone" v-model="form.phone" type="tel" :placeholder="t('manualBooking.guestPhonePlaceholder')" :invalid="!!errors.guestPhone" />
          <small v-if="errors.guestPhone" class="p-error">{{ errors.guestPhone }}</small>
        </div>
        <div v-if="!fixedHotelId" class="col-12 md:col-6 field">
          <label for="mb-hotel" class="block mb-2">{{ t('guestSearch.hotel') }} *</label>
          <pv-select v-model="form.hotelId" input-id="mb-hotel" :options="hotels" option-label="name" option-value="id" :placeholder="t('guestSearch.hotelPlaceholder')" :invalid="!!errors.hotelId" @change="clearRooms" />
          <small v-if="errors.hotelId" class="p-error">{{ errors.hotelId }}</small>
        </div>
      </div>

      <h3 class="text-base font-semibold mt-2 mb-2">{{ t('manualBooking.staySection') }}</h3>
      <StayPicker :stay="form.stay" :error="errors.stay" id-prefix="mb" @update:stay="onStayChange" />
      <div class="flex justify-content-end mb-3">
        <pv-button :label="t('manualBooking.findRooms')" icon="pi pi-search" class="p-button-outlined w-auto" :loading="bookingStore.searching" @click="findRooms" />
      </div>

      <!-- Only rooms free for the whole stay (availability is validated again when creating) -->
      <template v-if="searched">
        <small v-if="errors.roomId" class="p-error block mb-2">{{ errors.roomId }}</small>
        <div v-if="bookingStore.availableRooms.length" class="room-options" role="radiogroup" :aria-label="t('manualBooking.roomSection')">
          <button
              v-for="room in bookingStore.availableRooms"
              :key="room.roomId"
              type="button"
              role="radio"
              :aria-checked="form.roomId === room.roomId"
              class="room-option"
              :class="{ selected: form.roomId === room.roomId }"
              @click="form.roomId = room.roomId"
          >
            <span class="font-bold">{{ room.label }}</span>
            <span class="text-sm">{{ room.roomTypeName }}</span>
            <span class="text-sm text-color-secondary">{{ formatMoney(room.pricePerNight, locale) }} / {{ t('manualBooking.night') }}</span>
            <span class="font-semibold">{{ formatMoney(room.total, locale) }}</span>
          </button>
        </div>
        <pv-message v-else severity="warn">{{ t('guestSearch.noResults') }}</pv-message>
      </template>

      <pv-message v-if="unavailable" severity="error" class="mt-3">{{ t('manualBooking.noLongerAvailable') }}</pv-message>
      <pv-message v-else-if="errorMessage" severity="error" class="mt-3">{{ errorMessage }}</pv-message>
      <small class="block mt-3 text-color-secondary">{{ t('manualBooking.pendingNote') }}</small>
    </form>

    <template #footer>
      <pv-button :label="t('common.cancel')" class="p-button-text" @click="emit('update:visible', false)" />
      <pv-button :label="t('manualBooking.create')" icon="pi pi-check" :loading="bookingStore.saving" :disabled="!form.roomId" @click="create" />
    </template>
  </pv-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';
import { BookingFailureReason } from '../../application/booking-failure.js';
import { CreateBookingCommand, GuestContact } from '../../domain/commands/create-booking.command.js';
import { SearchAvailabilityQuery } from '../../domain/commands/search-availability.query.js';
import { StayPeriod } from '../../domain/model/stay-period.js';
import StayPicker from './StayPicker.vue';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/**
 * US-07 scenario 2: reception or an administrator books a room for a guest who called or walked in.
 * The guest does not need an account (name + e-mail for the notifications, optional phone). The booking is born
 * "Pendiente de pago"; availability is validated by the backend (409 when the room was taken meanwhile).
 */
const props = defineProps({
  visible: { type: Boolean, default: false },
  /** Hotel of the staff member; null lets a chain_admin choose one of `hotels`. */
  fixedHotelId: { type: Number, default: null },
  hotels: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:visible', 'created']);
const { t, locale } = useI18n();
const bookingStore = useBookingStore();

const form = reactive({ name: '', email: '', phone: '', hotelId: null, stay: new StayPeriod(null, null), roomId: null });
const errors = ref({});
const errorMessage = ref('');
const unavailable = ref(false);
const searched = ref(false);

const messages = (violations) => Object.fromEntries(Object.entries(violations).map(([field, { code }]) => [
  field,
  field === 'stay' ? t(`stayRules.${code}`) : t(`manualBooking.rules.${code}`),
]));

function reset() {
  Object.assign(form, { name: '', email: '', phone: '', hotelId: props.fixedHotelId, stay: new StayPeriod(null, null), roomId: null });
  errors.value = {};
  errorMessage.value = '';
  unavailable.value = false;
  searched.value = false;
  bookingStore.clearSearch();
}

function clearRooms() {
  form.roomId = null;
  searched.value = false;
  bookingStore.clearSearch();
}

function onStayChange(stay) {
  form.stay = stay;
  clearRooms();
}

async function findRooms() {
  errorMessage.value = '';
  unavailable.value = false;
  const hotelId = props.fixedHotelId ?? form.hotelId;
  const query = new SearchAvailabilityQuery({ hotelId, stay: form.stay });
  const rule = query.validate();
  errors.value = {
    ...(hotelId ? {} : { hotelId: t('guestSearch.hotelRequired') }),
    ...(rule ? { stay: t(`stayRules.${rule}`) } : {}),
  };
  if (!hotelId || rule) return;
  try {
    await bookingStore.searchAvailability(query);
    form.roomId = null;
    searched.value = true;
  } catch (failure) {
    if (failure.fieldViolations?.stay) errors.value = messages({ stay: failure.fieldViolations.stay });
    else errorMessage.value = t(failureMessageKey(failure));
  }
}

async function create() {
  errorMessage.value = '';
  unavailable.value = false;
  const command = new CreateBookingCommand({
    roomId: form.roomId,
    stay: form.stay,
    guest: new GuestContact({ name: form.name, email: form.email, phone: form.phone }),
  });
  const violations = command.validate();
  errors.value = messages(violations);
  if (Object.keys(violations).length > 0) return;

  try {
    const booking = await bookingStore.createBooking(command);
    emit('created', booking);
    emit('update:visible', false);
  } catch (failure) {
    if (failure.reason === BookingFailureReason.ROOM_UNAVAILABLE) {
      unavailable.value = true;
      await bookingStore.repeatLastSearch().catch(() => {});
      form.roomId = null;
    } else if (failure.hasFieldViolations) {
      errors.value = messages(failure.fieldViolations);
    } else {
      errorMessage.value = t(failureMessageKey(failure, { forbidden: 'manualBooking.otherHotel', hotelNotAcceptingBookings: 'manualBooking.hotelNotAccepting' }));
    }
  }
}
</script>

<style scoped>
.room-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.5rem;
}
.room-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.room-option.selected {
  border: 2px solid #2563eb;
  background: #eff6ff;
}
</style>
