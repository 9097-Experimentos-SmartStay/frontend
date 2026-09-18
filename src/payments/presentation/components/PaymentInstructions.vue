<template>
  <section class="payment-instructions">
    <h3 class="text-lg font-bold mt-0 mb-2">{{ t('guestPayment.howToPay') }}</h3>
    <p class="m-0 mb-3 line-height-3">{{ t('guestPayment.instructionsIntro', { total: formatMoney(booking.total, locale), code: booking.reference }) }}</p>

    <!-- The payment methods of the hotel, sent with the Pending booking -->
    <dl v-if="instructions" class="methods surface-50 border-round p-3 mb-3">
      <div v-if="instructions.accountHolder">
        <dt>{{ t('guestPayment.accountHolder') }}</dt>
        <dd>{{ instructions.accountHolder }}</dd>
      </div>
      <div v-if="instructions.yapeNumber">
        <dt>{{ t('paymentMethods.Yape') }}</dt>
        <dd class="font-mono">{{ phone(instructions.yapeNumber) }}</dd>
      </div>
      <div v-if="instructions.plinNumber">
        <dt>{{ t('paymentMethods.Plin') }}</dt>
        <dd class="font-mono">{{ phone(instructions.plinNumber) }}</dd>
      </div>
      <div v-if="instructions.hasBankTransfer" class="full">
        <dt>{{ t('paymentMethods.BankTransfer') }}</dt>
        <dd>
          <span v-if="instructions.bankName" class="block">{{ instructions.bankName }}</span>
          <span class="block">{{ t('guestPayment.account') }}: <span class="font-mono">{{ instructions.bankAccountNumber }}</span></span>
          <span v-if="instructions.bankAccountCci" class="block">{{ t('guestPayment.cci') }}: <span class="font-mono">{{ instructions.bankAccountCci }}</span></span>
        </dd>
      </div>
    </dl>

    <div v-else class="flex flex-wrap gap-2 mb-3">
      <pv-tag v-for="method in REMOTE_PAYMENT_METHODS" :key="method" :value="t(`paymentMethods.${method}`)" severity="info" />
    </div>

    <ol class="pl-4 m-0 mb-3 line-height-3">
      <li v-if="!instructions">{{ t('guestPayment.steps.email', { email: booking.guestEmail }) }}</li>
      <li>{{ t('guestPayment.steps.reference', { code: booking.reference }) }}</li>
      <li>{{ t('guestPayment.steps.keepReceipt') }}</li>
      <li>{{ t('guestPayment.steps.confirmation') }}</li>
    </ol>

    <PaymentDeadline :booking="booking" />
    <small class="block mt-2 text-color-secondary">{{ t('guestPayment.atFrontDesk') }}</small>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { REMOTE_PAYMENT_METHODS } from '../../domain/model/payment-method.js';
import PaymentDeadline from '@/bookings/presentation/components/PaymentDeadline.vue';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';

/**
 * How to pay a Pending booking (US-51 scenario 2). Guests pay outside the app, quoting the booking code, before
 * the deadline; the hotel registers the payment and the booking is confirmed. The payment methods are the hotel's
 * own (account holder, Yape, Plin, bank account and CCI), sent by the API with the Pending booking
 * (`paymentInstructions`); the same data goes in the booking e-mail.
 */
const props = defineProps({
  /** @type {import('@/bookings/domain/model/booking.entity.js').Booking} */
  booking: { type: Object, required: true },
});
const { t, locale } = useI18n();

const instructions = computed(() => props.booking.paymentInstructions);

/** "987654321" → "987 654 321", easier to type in the wallet app. */
const phone = (number) => (/^\d{9}$/.test(number) ? number.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : number);
</script>

<style scoped>
.methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem 1.5rem;
  margin-top: 0;
}
.methods .full {
  grid-column: 1 / -1;
}
.methods dt {
  font-size: 0.8rem;
  color: var(--p-text-muted-color, #64748b);
}
.methods dd {
  margin: 0;
  font-weight: 500;
}
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
</style>
