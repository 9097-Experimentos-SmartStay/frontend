<template>
  <pv-tag :value="badge.label" :severity="badge.severity" rounded />
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { bookingBadge } from '../utils/booking-status.js';

/** Status badge of a booking ("Pendiente de pago", "Confirmada", "Vencida", "Cancelada · reembolsada"...). */
const props = defineProps({
  /** @type {import('../../domain/model/booking.entity.js').Booking} */
  booking: { type: Object, required: true },
});
const { t } = useI18n();
const badge = computed(() => bookingBadge(t, props.booking));
</script>
