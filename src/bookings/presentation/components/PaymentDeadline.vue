<template>
  <div v-if="booking.isPending() && booking.paymentDueAt" class="payment-deadline" :class="{ overdue: timeLeft <= 0, urgent: timeLeft > 0 && timeLeft < URGENT_MS }">
    <i class="pi pi-clock"></i>
    <span>
      {{ t('paymentDeadline.payBefore', { time: formatDateTime(booking.paymentDueAt, locale) }) }}
      <strong v-if="timeLeft > 0">· {{ t('paymentDeadline.left', { time: remaining }) }}</strong>
      <strong v-else>· {{ t('paymentDeadline.passed') }}</strong>
    </span>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDateTime } from '@/shared/presentation/utils/formatters.js';

/**
 * Payment deadline of a Pending booking in the user's local time, with a countdown (US-51 scenario 2):
 * without a registered payment before `paymentDueAt`, the booking is cancelled automatically.
 */
const props = defineProps({
  /** @type {import('../../domain/model/booking.entity.js').Booking} */
  booking: { type: Object, required: true },
});
const { t, locale } = useI18n();

const URGENT_MS = 3 * 60 * 60 * 1000;
const now = ref(new Date());
let timer = null;

const timeLeft = computed(() => props.booking.paymentTimeLeft(now.value) ?? 0);
const remaining = computed(() => {
  const minutes = Math.max(0, Math.floor(timeLeft.value / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? t('duration.hoursMinutes', { hours, minutes: minutes % 60 }) : t('duration.minutes', { minutes });
});

onMounted(() => {
  timer = setInterval(() => { now.value = new Date(); }, 30 * 1000);
});
onBeforeUnmount(() => clearInterval(timer));
</script>

<style scoped>
.payment-deadline {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: #fffbeb;
  color: #92400e;
  font-size: 0.9rem;
}
.payment-deadline.urgent {
  background: #fff7ed;
  color: #9a3412;
}
.payment-deadline.overdue {
  background: #f1f5f9;
  color: #475569;
}
</style>
