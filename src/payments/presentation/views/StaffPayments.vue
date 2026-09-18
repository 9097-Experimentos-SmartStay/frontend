<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="flex justify-content-between align-items-center mb-6">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="goBack" />
        <h1 class="text-3xl font-bold text-color m-0">{{ t('staffPayments.title') }}</h1>
      </div>
    </div>

    <div v-if="loading" class="flex justify-content-center p-8">
      <pv-progress-spinner />
    </div>

    <pv-data-table
        v-else-if="rows.length"
        :value="rows"
        responsive-layout="scroll"
        class="shadow-2 border-round-xl overflow-hidden"
        paginator :rows="10"
    >
      <template #header>
        <div class="flex align-items-center justify-content-between p-3 surface-card border-bottom-1 surface-border">
          <span class="text-xl font-bold text-color">{{ t('staffPayments.all') }}</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" :aria-label="t('common.refresh')" v-tooltip="t('common.refresh')" @click="load" />
        </div>
      </template>

      <pv-column field="payment.id" header="ID" sortable style="width: 80px" />
      <pv-column field="payment.bookingId" :header="t('staffPayments.booking')" sortable>
        <template #body="{ data }">#{{ data.payment.bookingId }}</template>
      </pv-column>
      <pv-column :header="t('staffBookings.guest')">
        <template #body="{ data }">
          <div class="flex flex-column">
            <span class="font-medium">{{ data.booking?.guestName ?? '—' }}</span>
            <span class="text-sm text-color-secondary">{{ data.booking?.guestEmail }}</span>
          </div>
        </template>
      </pv-column>
      <pv-column field="payment.amount" :header="t('payments.amount')" sortable>
        <template #body="{ data }">
          <span class="font-medium text-color">{{ formatMoney(data.payment.amount, locale) }}</span>
        </template>
      </pv-column>
      <pv-column field="payment.method" :header="t('registerPayment.method')">
        <template #body="{ data }">{{ data.payment.method ? t(`paymentMethods.${data.payment.method}`, data.payment.method) : (data.payment.cardNumberMasked ?? '—') }}</template>
      </pv-column>
      <pv-column field="payment.status" :header="t('bookings.status')" sortable>
        <template #body="{ data }">
          <pv-tag :value="paymentStatusLabel(t, data.payment.status)" :severity="paymentStatusSeverity(data.payment.status)" rounded />
        </template>
      </pv-column>
      <pv-column :header="t('payments.date')">
        <template #body="{ data }">{{ formatDateTime(data.payment.paymentDate, locale) }}</template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 surface-card border-round-xl border-1 surface-border shadow-1">
      <i class="pi pi-wallet text-500 text-6xl mb-4"></i>
      <h3 class="text-color font-bold m-0 mb-2">{{ t('staffPayments.empty') }}</h3>
      <p class="text-color-secondary">{{ t('staffPayments.emptyHint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { usePaymentStore } from '../../application/payment.store.js';
import { paymentStatusLabel, paymentStatusSeverity } from '../utils/payment-status.js';
import { useBookingStore } from '@/bookings/application/booking.store.js';
import { formatDateTime, formatMoney } from '@/shared/presentation/utils/formatters.js';

/**
 * Payments of the staff area (reception, admin, chain_admin).
 * The API has no "list payments" endpoint (§9): the payment of each booking is requested.
 */
const router = useRouter();
const toast = useToast();
const { t, locale } = useI18n();
const paymentStore = usePaymentStore();
const bookingStore = useBookingStore();

const loading = computed(() => paymentStore.loading || bookingStore.loading);
const rows = computed(() => paymentStore.payments.map((payment) => ({
  payment,
  booking: bookingStore.bookings.find((booking) => booking.id === payment.bookingId) ?? null,
})));

async function load() {
  await bookingStore.fetchBookings();
  await paymentStore.fetchPaymentsForBookings(bookingStore.bookings.map((booking) => booking.id));
  if (paymentStore.error) {
    toast.add({ severity: 'warn', summary: t('common.warning'), detail: t('staffPayments.partial'), life: 4000 });
  }
}

onMounted(load);

const goBack = () => router.push({ name: 'staff-dashboard' });
</script>
