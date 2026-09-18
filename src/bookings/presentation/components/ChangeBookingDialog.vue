<template>
  <pv-dialog
      :visible="visible"
      modal
      :header="booking ? t('changeBooking.title', { code: booking.reference }) : ''"
      :style="{ width: '44rem' }"
      :breakpoints="{ '768px': '95vw' }"
      @update:visible="emit('update:visible', $event)"
      @show="reset"
  >
    <template v-if="booking">
      <p class="mt-0 text-color-secondary">
        {{ t('changeBooking.current', {
          room: booking.roomLabel,
          checkIn: formatDay(booking.checkInDate, locale, 'medium'),
          checkOut: formatDay(booking.checkOutDate, locale, 'medium'),
          total: formatMoney(booking.total, locale),
        }) }}
      </p>
      <pv-message v-if="booking.isConfirmed()" severity="info" class="mb-3">
        {{ t('changeBooking.paidRule', { total: formatMoney(booking.total, locale) }) }}
      </pv-message>

      <StayPicker :stay="stay" :error="stayError" id-prefix="cb" @update:stay="onStayChange" />

      <div class="field p-fluid">
        <label for="cb-room" class="font-medium block mb-2">{{ t('changeBooking.room') }}</label>
        <pv-select
            v-model="roomId"
            input-id="cb-room"
            :options="roomOptions"
            option-label="label"
            option-value="value"
            :loading="bookingStore.searching"
        />
        <small class="text-color-secondary">{{ t('changeBooking.roomHint') }}</small>
      </div>

      <pv-message v-if="errorMessage" severity="error" class="mt-2">{{ errorMessage }}</pv-message>
      <small class="block mt-2 text-color-secondary">{{ t('changeBooking.notifyHint') }}</small>
    </template>

    <template #footer>
      <pv-button :label="t('common.cancel')" class="p-button-text" @click="emit('update:visible', false)" />
      <pv-button :label="t('changeBooking.submit')" icon="pi pi-check" :loading="bookingStore.saving" @click="submit" />
    </template>
  </pv-dialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';
import { BookingFailureReason } from '../../application/booking-failure.js';
import { ChangeBookingCommand, ChangeBookingRuleError } from '../../domain/commands/change-booking.command.js';
import { SearchAvailabilityQuery } from '../../domain/commands/search-availability.query.js';
import StayPicker from './StayPicker.vue';
import { formatDay, formatMoney } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/**
 * US-07 scenario 3: change the dates and/or the room (same hotel) of a Pending or Confirmed booking.
 * The backend validates availability again (the booking does not conflict with itself) and e-mails the guest.
 * The other rooms offered are those free for the new dates; the current room is always an option.
 */
const props = defineProps({
  visible: { type: Boolean, default: false },
  /** @type {import('../../domain/model/booking.entity.js').Booking} */
  booking: { type: Object, default: null },
});
const emit = defineEmits(['update:visible', 'changed']);
const { t, locale } = useI18n();
const bookingStore = useBookingStore();

const stay = ref(null);
const roomId = ref(null);
const stayError = ref('');
const errorMessage = ref('');

const roomOptions = computed(() => {
  if (!props.booking) return [];
  const current = { value: props.booking.roomId, label: t('changeBooking.keepRoom', { room: props.booking.roomLabel }) };
  const others = bookingStore.availableRooms
    .filter((room) => room.roomId !== props.booking.roomId)
    .map((room) => ({ value: room.roomId, label: `${room.label} · ${room.roomTypeName} · ${formatMoney(room.total, locale.value)}` }));
  return [current, ...others];
});

async function loadRooms() {
  if (!stay.value?.isComplete || stay.value.validate()) return;
  await bookingStore.searchAvailability(new SearchAvailabilityQuery({ hotelId: props.booking.hotelId, stay: stay.value })).catch(() => {});
}

function reset() {
  stay.value = props.booking.stay;
  roomId.value = props.booking.roomId;
  stayError.value = '';
  errorMessage.value = '';
  bookingStore.clearSearch();
  loadRooms();
}

function onStayChange(value) {
  stay.value = value;
  stayError.value = '';
  if (roomId.value !== props.booking.roomId) roomId.value = props.booking.roomId;
  loadRooms();
}

async function submit() {
  errorMessage.value = '';
  const command = new ChangeBookingCommand({ booking: props.booking, stay: stay.value, roomId: roomId.value });
  const rule = command.validate();
  if (rule === ChangeBookingRuleError.NOTHING_CHANGED) {
    errorMessage.value = t('changeBooking.nothingChanged');
    return;
  }
  stayError.value = rule ? t(`stayRules.${rule}`) : '';
  if (rule) return;

  try {
    const updated = await bookingStore.changeBooking(command);
    emit('changed', updated);
    emit('update:visible', false);
  } catch (failure) {
    if (failure.fieldViolations?.stay) {
      stayError.value = t(`stayRules.${failure.fieldViolations.stay.code}`);
      return;
    }
    if (failure.reason === BookingFailureReason.ROOM_UNAVAILABLE) await loadRooms();
    errorMessage.value = t(failureMessageKey(failure, {
      roomUnavailable: 'changeBooking.unavailable',
      paidTotalMismatch: 'changeBooking.paidTotalMismatch',
      notChangeable: 'changeBooking.notChangeable',
      otherHotelRoom: 'changeBooking.otherHotelRoom',
      checkInInPast: 'stayRules.checkInInPast',
    }), { total: formatMoney(props.booking.total, locale.value) });
  }
}
</script>
