<template>
  <pv-dialog
      :visible="visible"
      modal
      :header="booking ? t('staffBookings.detailTitle', { code: booking.reference }) : ''"
      :style="{ width: '44rem' }"
      :breakpoints="{ '768px': '95vw' }"
      @update:visible="emit('update:visible', $event)"
      @show="loadPayment"
  >
    <template v-if="booking">
      <div class="flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <BookingStatusTag :booking="booking" />
        <span class="text-color-secondary text-sm">{{ t('staffBookings.createdAt', { time: formatDateTime(booking.createdAt, locale) }) }}</span>
      </div>

      <dl class="detail">
        <div><dt>{{ t('staffBookings.guest') }}</dt><dd>{{ booking.guestName }}</dd></div>
        <div><dt>{{ t('manualBooking.guestEmail') }}</dt><dd>{{ booking.guestEmail }}</dd></div>
        <div v-if="booking.guestPhone"><dt>{{ t('manualBooking.guestPhone') }}</dt><dd>{{ booking.guestPhone }}</dd></div>
        <div><dt>{{ t('staffBookings.room') }}</dt><dd>{{ booking.roomLabel }}</dd></div>
        <div><dt>{{ t('stay.checkIn') }}</dt><dd>{{ formatDay(booking.checkInDate, locale, 'medium') }}</dd></div>
        <div><dt>{{ t('stay.checkOut') }}</dt><dd>{{ formatDay(booking.checkOutDate, locale, 'medium') }}</dd></div>
        <div><dt>{{ t('guestPayment.pricePerNight') }}</dt><dd>{{ formatMoney(booking.pricePerNight, locale) }} × {{ booking.nights }}</dd></div>
        <div><dt>{{ t('guestSearch.total') }}</dt><dd class="font-bold">{{ formatMoney(booking.total, locale) }}</dd></div>
      </dl>

      <PaymentDeadline v-if="booking.isPending()" :booking="booking" class="mt-3" />

      <pv-message v-if="booking.isCancelled()" :severity="booking.isExpired ? 'secondary' : 'warn'" class="mt-3">
        {{ cancellationReasonText(t, booking) }}
        <span v-if="booking.cancelledAt"> {{ t('guestBookingDetail.cancelledAt', { time: formatDateTime(booking.cancelledAt, locale) }) }}</span>
      </pv-message>

      <section v-if="payment" class="mt-3">
        <h3 class="text-base font-semibold mb-2">{{ t('guestBookingDetail.payment') }}</h3>
        <PaymentSummary :payment="payment" />
      </section>

      <small v-if="canCancel && (booking.isPending() || booking.isConfirmed()) && !booking.canBeCancelled()" class="block mt-3 text-color-secondary">
        {{ cancellationBlockText(t, booking, locale) }}
      </small>
    </template>

    <template #footer>
      <div v-if="booking" class="flex flex-wrap gap-2 justify-content-end">
        <pv-button
            v-if="canCancel && (booking.isPending() || booking.isConfirmed())"
            :label="t('staffBookings.cancel')"
            icon="pi pi-times"
            class="p-button-danger p-button-text"
            :disabled="!booking.canBeCancelled()"
            @click="emit('cancel', booking)"
        />
        <pv-button
            v-if="canManage && booking.canBeChanged()"
            :label="t('staffBookings.change')"
            icon="pi pi-pencil"
            class="p-button-outlined"
            @click="emit('change', booking)"
        />
        <pv-button
            v-if="canRegisterPayments && booking.canBePaid()"
            :label="t('registerPayment.action')"
            icon="pi pi-wallet"
            class="p-button-success"
            @click="emit('register-payment', booking)"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BookingStatusTag from './BookingStatusTag.vue';
import PaymentDeadline from './PaymentDeadline.vue';
import { cancellationBlockText, cancellationReasonText } from '../utils/booking-status.js';
import { usePaymentStore } from '@/payments/application/payment.store.js';
import PaymentSummary from '@/payments/presentation/components/PaymentSummary.vue';
import { formatDateTime, formatDay, formatMoney } from '@/shared/presentation/utils/formatters.js';

/**
 * A booking of the hotel (US-07): every key fact, the payment (method, operation number, Completed or Refunded),
 * the expiry reason, and the actions the role allows (register payment, change, cancel with the policy).
 */
const props = defineProps({
  visible: { type: Boolean, default: false },
  /** @type {import('../../domain/model/booking.entity.js').Booking} */
  booking: { type: Object, default: null },
  canRegisterPayments: { type: Boolean, default: false },
  canManage: { type: Boolean, default: false },
  canCancel: { type: Boolean, default: false },
});
const emit = defineEmits(['update:visible', 'register-payment', 'change', 'cancel']);
const { t, locale } = useI18n();
const paymentStore = usePaymentStore();
const payment = ref(null);

async function loadPayment() {
  payment.value = null;
  if (props.booking && (props.booking.wasPaid || props.booking.isConfirmed())) {
    payment.value = await paymentStore.fetchPaymentByBooking(props.booking.id);
  }
}
</script>

<style scoped>
.detail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.75rem 1.5rem;
  margin: 0;
}
.detail dt {
  font-size: 0.8rem;
  color: #64748b;
}
.detail dd {
  margin: 0;
  font-weight: 500;
  word-break: break-word;
}
</style>
