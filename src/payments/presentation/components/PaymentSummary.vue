<template>
  <dl class="payment-summary">
    <div><dt>{{ t('payments.amount') }}</dt><dd class="font-bold">{{ formatMoney(payment.amount, locale) }}</dd></div>
    <div><dt>{{ t('registerPayment.method') }}</dt><dd>{{ payment.method ? t(`paymentMethods.${payment.method}`, payment.method) : '—' }}</dd></div>
    <div v-if="payment.operationNumber"><dt>{{ t('registerPayment.operationNumber') }}</dt><dd>{{ payment.operationNumber }}</dd></div>
    <div>
      <dt>{{ t('bookings.status') }}</dt>
      <dd><pv-tag :value="paymentStatusLabel(t, payment.status)" :severity="paymentStatusSeverity(payment.status)" rounded /></dd>
    </div>
    <div><dt>{{ t('payments.date') }}</dt><dd>{{ formatDateTime(payment.paymentDate, locale) }}</dd></div>
    <div v-if="payment.refundedAt"><dt>{{ t('payments.refundedAt') }}</dt><dd>{{ formatDateTime(payment.refundedAt, locale) }}</dd></div>
    <div v-if="payment.note" class="col-span"><dt>{{ t('registerPayment.note') }}</dt><dd>{{ payment.note }}</dd></div>
  </dl>
  <small v-if="payment.isRefunded()" class="block mt-2 text-color-secondary">{{ t('payments.refundedHint') }}</small>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { paymentStatusLabel, paymentStatusSeverity } from '../utils/payment-status.js';
import { formatDateTime, formatMoney } from '@/shared/presentation/utils/formatters.js';

/** A registered payment: amount, method, operation number, status (Completed / Refunded) and dates (§9). */
defineProps({
  /** @type {import('../../domain/model/payment.entity.js').Payment} */
  payment: { type: Object, required: true },
});
const { t, locale } = useI18n();
</script>

<style scoped>
.payment-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem 1.5rem;
  margin: 0;
}
.payment-summary dt {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.15rem;
}
.payment-summary dd {
  margin: 0;
}
.payment-summary .col-span {
  grid-column: 1 / -1;
}
</style>
