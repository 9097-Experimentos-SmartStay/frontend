<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-6xl mx-auto">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="goBack" />
          <h1 class="text-3xl font-bold text-color m-0">{{ t('guestPayment.byBookingTitle', { id: bookingId }) }}</h1>
        </div>
      </div>

      <div v-if="paymentStore.loading" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <pv-data-table
          v-else-if="paymentsList.length"
          :value="paymentsList"
          responsive-layout="scroll"
          class="shadow-2 border-round-xl overflow-hidden"
      >
        <pv-column field="id" header="ID" />
        <pv-column field="amount" :header="t('payments.amount')">
          <template #body="{ data }">
            <span class="font-bold text-900">{{ formatMoney(data.amount, locale) }}</span>
          </template>
        </pv-column>
        <pv-column field="cardNumberMasked" :header="t('guestPayment.card')" />
        <pv-column field="status" :header="t('bookings.status')">
          <template #body="{ data }">
            <pv-tag :value="paymentStatusLabel(t, data.status)" :severity="paymentStatusSeverity(data.status)" rounded />
          </template>
        </pv-column>
        <pv-column field="paymentDate" :header="t('payments.date')">
          <template #body="{ data }">{{ formatDateTime(data.paymentDate, locale) }}</template>
        </pv-column>
        <pv-column field="transactionId" :header="t('guestPayment.transactionColumn')">
          <template #body="{ data }">
            <span class="text-sm text-500">{{ data.transactionId || '—' }}</span>
          </template>
        </pv-column>
      </pv-data-table>

      <div v-else class="text-center p-8 surface-card border-round-xl shadow-1">
        <i class="pi pi-credit-card text-500 text-6xl mb-3"></i>
        <p class="text-xl text-color font-medium">{{ t('guestPayment.noPayments') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePaymentStore } from '../../application/payment.store.js';
import { paymentStatusLabel, paymentStatusSeverity } from '../utils/payment-status.js';
import { formatDateTime, formatMoney } from '@/shared/presentation/utils/formatters.js';

const props = defineProps({
  bookingId: { type: [String, Number], required: true }
});

const router = useRouter();
const { t, locale } = useI18n();
const paymentStore = usePaymentStore();

/** GET /payments/booking/{id} returns ONE payment: the completed one, or the latest attempt. */
const paymentsList = computed(() => (paymentStore.currentPayment ? [paymentStore.currentPayment] : []));

onMounted(() => paymentStore.fetchPaymentByBooking(Number(props.bookingId)).catch(() => {}));

const goBack = () => router.push({ name: 'guest-booking-detail', params: { bookingId: props.bookingId } });
</script>
