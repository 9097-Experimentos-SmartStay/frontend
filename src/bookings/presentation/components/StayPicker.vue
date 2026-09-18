<template>
  <div class="grid formgrid p-fluid">
    <div class="col-12 md:col-6 field">
      <label :for="`${idPrefix}-check-in`" class="font-medium block mb-2">{{ t('stay.checkIn') }} *</label>
      <pv-date-picker
          :model-value="stay.checkIn?.toDate() ?? null"
          :input-id="`${idPrefix}-check-in`"
          :min-date="minCheckIn"
          show-icon
          icon-display="input"
          :manual-input="false"
          :invalid="!!error"
          :placeholder="t('stay.pickDate')"
          @update:model-value="onCheckIn"
      />
    </div>
    <div class="col-12 md:col-6 field">
      <label :for="`${idPrefix}-check-out`" class="font-medium block mb-2">{{ t('stay.checkOut') }} *</label>
      <pv-date-picker
          :model-value="stay.checkOut?.toDate() ?? null"
          :input-id="`${idPrefix}-check-out`"
          :min-date="minCheckOut"
          show-icon
          icon-display="input"
          :manual-input="false"
          :invalid="!!error"
          :placeholder="t('stay.pickDate')"
          @update:model-value="onCheckOut"
      />
    </div>
    <div class="col-12">
      <small v-if="error" class="p-error block" role="alert">{{ error }}</small>
      <small v-else-if="stay.nights > 0" class="text-color-secondary">{{ t('stay.nights', { count: stay.nights }, stay.nights) }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { StayPeriod } from '../../domain/model/stay-period.js';

/**
 * Check-in / check-out picker (calendar days). The calendars already block the past and a check-out that is not
 * after the check-in (US-51 scenario 4); the parent still validates the StayPeriod before sending.
 */
const props = defineProps({
  /** @type {StayPeriod} */
  stay: { type: Object, required: true },
  error: { type: String, default: '' },
  idPrefix: { type: String, default: 'stay' },
});
const emit = defineEmits(['update:stay']);
const { t } = useI18n();

const minCheckIn = computed(() => CalendarDate.today().toDate());
const minCheckOut = computed(() => (props.stay.checkIn ?? CalendarDate.today()).addDays(1).toDate());

function onCheckIn(value) {
  const checkIn = CalendarDate.from(value);
  // Moving the check-in past the check-out clears the check-out: the stay must have at least one night.
  const checkOut = checkIn && props.stay.checkOut && !checkIn.isBefore(props.stay.checkOut) ? null : props.stay.checkOut;
  emit('update:stay', new StayPeriod(checkIn, checkOut));
}

function onCheckOut(value) {
  emit('update:stay', new StayPeriod(props.stay.checkIn, CalendarDate.from(value)));
}
</script>
