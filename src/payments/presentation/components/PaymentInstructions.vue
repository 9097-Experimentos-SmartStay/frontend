<template>
  <section class="payment-instructions">
    <h3 class="text-lg font-bold mt-0 mb-2">{{ t('guestPayment.howToPay') }}</h3>
    <p class="m-0 mb-3 line-height-3">{{ t('guestPayment.instructionsIntro', { total: formatMoney(booking.total, locale), code: booking.reference }) }}</p>

    <div class="flex flex-wrap gap-2 mb-3">
      <pv-tag v-for="method in REMOTE_PAYMENT_METHODS" :key="method" :value="t(`paymentMethods.${method}`)" severity="info" />
    </div>

    <ol class="pl-4 m-0 mb-3 line-height-3">
      <li>{{ t('guestPayment.steps.email', { email: booking.guestEmail }) }}</li>
      <li>{{ t('guestPayment.steps.reference', { code: booking.reference }) }}</li>
      <li>{{ t('guestPayment.steps.keepReceipt') }}</li>
      <li>{{ t('guestPayment.steps.confirmation') }}</li>
    </ol>

    <PaymentDeadline :booking="booking" />
    <small class="block mt-2 text-color-secondary">{{ t('guestPayment.atFrontDesk') }}</small>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { REMOTE_PAYMENT_METHODS } from '../../domain/model/payment-method.js';
import PaymentDeadline from '@/bookings/presentation/components/PaymentDeadline.vue';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';

/**
 * How to pay a Pending booking (US-51 scenario 2). Guests pay outside the app: Yape, Plin or bank transfer,
 * quoting the booking code, before the deadline; the hotel registers the payment and the booking is confirmed.
 * The account numbers and holder are in the e-mail the backend sends (Payments__Instructions__*): the API does
 * not expose them, so they are not repeated here.
 */
defineProps({
  /** @type {import('@/bookings/domain/model/booking.entity.js').Booking} */
  booking: { type: Object, required: true },
});
const { t, locale } = useI18n();
</script>
