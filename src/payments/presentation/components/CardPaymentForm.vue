<template>
  <section class="card-payment">
    <h3 class="text-lg font-bold mt-0 mb-2">{{ t('cardPayment.title') }}</h3>
    <p class="m-0 mb-3 line-height-3">{{ t('cardPayment.intro', { total: formatMoney(booking.total, locale), code: booking.reference }) }}</p>

    <!-- The API gateway is simulated: say so, and how to try both outcomes -->
    <pv-message severity="info" :closable="false" class="mb-4">
      <span class="block mb-1">{{ t('cardPayment.simulated') }}</span>
      <span class="block text-sm">
        {{ t('cardPayment.testApproved') }} <span class="font-mono">4242 4242 4242 4242</span> ·
        {{ t('cardPayment.testDeclined') }} <span class="font-mono">4000 0000 0000 0002</span>
      </span>
    </pv-message>

    <!-- Live preview of what the guest is typing (never the CVV) -->
    <div class="card-preview mb-4" aria-hidden="true">
      <div class="flex justify-content-between align-items-start">
        <span class="card-preview__chip"></span>
        <span class="card-preview__brand">{{ brandLabel }}</span>
      </div>
      <div class="card-preview__number font-mono">{{ previewNumber }}</div>
      <div class="flex justify-content-between align-items-end gap-3">
        <div class="min-w-0">
          <span class="card-preview__label">{{ t('cardPayment.holder') }}</span>
          <span class="card-preview__value card-preview__holder">{{ form.holderName || t('cardPayment.holderPlaceholder') }}</span>
        </div>
        <div class="flex-none text-right">
          <span class="card-preview__label">{{ t('cardPayment.expiry') }}</span>
          <span class="card-preview__value font-mono">{{ form.expiry || 'MM/AA' }}</span>
        </div>
      </div>
    </div>

    <form class="p-fluid" novalidate autocomplete="on" @submit.prevent="submit">
      <div class="field">
        <label for="cp-number" class="font-medium block mb-2">{{ t('cardPayment.number') }} *</label>
        <pv-icon-field>
          <pv-input-icon class="pi pi-credit-card" />
          <pv-input-text
              id="cp-number"
              :model-value="form.cardNumber"
              inputmode="numeric"
              autocomplete="cc-number"
              placeholder="1234 5678 9012 3456"
              :maxlength="23"
              :invalid="!!errors.cardNumber"
              :aria-describedby="errors.cardNumber ? 'cp-number-error' : undefined"
              class="font-mono"
              @update:model-value="onNumberInput"
          />
        </pv-icon-field>
        <small v-if="errors.cardNumber" id="cp-number-error" class="p-error">{{ errors.cardNumber }}</small>
      </div>

      <div class="field">
        <label for="cp-holder" class="font-medium block mb-2">{{ t('cardPayment.holder') }} *</label>
        <pv-input-text
            id="cp-holder"
            v-model="form.holderName"
            autocomplete="cc-name"
            :placeholder="t('cardPayment.holderPlaceholder')"
            :maxlength="CARD_HOLDER_MAX_LENGTH"
            :invalid="!!errors.holderName"
            :aria-describedby="errors.holderName ? 'cp-holder-error' : undefined"
            class="uppercase"
        />
        <small v-if="errors.holderName" id="cp-holder-error" class="p-error">{{ errors.holderName }}</small>
      </div>

      <div class="formgrid grid">
        <div class="field col-6">
          <label for="cp-expiry" class="font-medium block mb-2">{{ t('cardPayment.expiry') }} *</label>
          <pv-input-mask
              id="cp-expiry"
              v-model="form.expiry"
              mask="99/99"
              placeholder="MM/AA"
              autocomplete="cc-exp"
              inputmode="numeric"
              :invalid="!!errors.expiry"
              :aria-describedby="errors.expiry ? 'cp-expiry-error' : undefined"
              class="font-mono"
          />
          <small v-if="errors.expiry" id="cp-expiry-error" class="p-error">{{ errors.expiry }}</small>
        </div>
        <div class="field col-6">
          <label for="cp-cvv" class="font-medium block mb-2">{{ t('cardPayment.cvv') }} *</label>
          <pv-input-text
              id="cp-cvv"
              v-model="form.cvv"
              type="password"
              inputmode="numeric"
              autocomplete="cc-csc"
              :maxlength="4"
              placeholder="•••"
              :invalid="!!errors.cvv"
              :aria-describedby="errors.cvv ? 'cp-cvv-error' : 'cp-cvv-hint'"
              class="font-mono"
          />
          <small v-if="errors.cvv" id="cp-cvv-error" class="p-error">{{ errors.cvv }}</small>
          <small v-else id="cp-cvv-hint" class="text-color-secondary">{{ t('cardPayment.cvvHint') }}</small>
        </div>
      </div>

      <pv-message v-if="errorMessage" severity="error" :closable="false" class="mb-3">{{ errorMessage }}</pv-message>

      <pv-button
          type="submit"
          icon="pi pi-lock"
          :label="t('cardPayment.pay', { total: formatMoney(booking.total, locale) })"
          :loading="paymentStore.paying"
          size="large"
      />
      <small class="block mt-2 text-color-secondary text-center">
        <i class="pi pi-shield mr-1" aria-hidden="true"></i>{{ t('cardPayment.notStored') }}
      </small>
    </form>

    <div class="mt-4">
      <PaymentDeadline :booking="booking" />
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePaymentStore } from '../../application/payment.store.js';
import {
  CARD_HOLDER_MAX_LENGTH,
  CardBrand,
  cardBrandOf,
  formatCardNumber,
  onlyDigits,
  PayWithCardCommand,
} from '../../domain/commands/pay-with-card.command.js';
import PaymentDeadline from '@/bookings/presentation/components/PaymentDeadline.vue';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey, violationMessages } from '@/shared/presentation/utils/failure-message.js';

/**
 * The guest pays a Pending booking online with a card (POST /bookings/{id}/payments/card). The amount is read-only:
 * it is always the booking total, and an approved charge confirms the booking (and e-mails the guest).
 *
 * The API gateway is simulated (no money moves) and the card is never stored: it only lives in this form until it
 * is sent, and is cleared after a failed attempt (the CVV) or once paid.
 */
const props = defineProps({
  /** @type {import('@/bookings/domain/model/booking.entity.js').Booking} */
  booking: { type: Object, required: true },
});
const emit = defineEmits(['paid']);
const { t, locale } = useI18n();
const paymentStore = usePaymentStore();

const form = reactive({ cardNumber: '', holderName: '', expiry: '', cvv: '' });
const errors = ref({});
const errorMessage = ref('');

const digits = computed(() => onlyDigits(form.cardNumber));
const brand = computed(() => cardBrandOf(digits.value));
const brandLabel = computed(() => (digits.value && brand.value !== CardBrand.UNKNOWN ? brand.value : ''));

/** "4242 42•• •••• ••••": what was typed, the rest as dots, in the brand's grouping (Amex 4-6-5). */
const previewNumber = computed(() => {
  const isAmex = brand.value === CardBrand.AMEX;
  const shown = digits.value.padEnd(isAmex ? 15 : 16, '•');
  if (isAmex) return [shown.slice(0, 4), shown.slice(4, 10), shown.slice(10)].join(' ');
  return shown.match(/.{1,4}/g).join(' ');
});

function onNumberInput(value) {
  form.cardNumber = formatCardNumber(onlyDigits(value).slice(0, 19));
}

async function submit() {
  errorMessage.value = '';
  const command = new PayWithCardCommand({ bookingId: props.booking.id, ...form });
  const violations = command.validate();
  errors.value = violationMessages(t, violations, 'cardPayment.rules');
  if (Object.keys(violations).length > 0) return;

  try {
    const payment = await paymentStore.payWithCard(command);
    Object.assign(form, { cardNumber: '', holderName: '', expiry: '', cvv: '' });
    emit('paid', payment);
  } catch (failure) {
    form.cvv = '';
    if (failure.hasFieldViolations) {
      errors.value = violationMessages(t, failure.fieldViolations, 'cardPayment.rules');
      return;
    }
    errorMessage.value = t(failureMessageKey(failure, {
      cardDeclined: 'cardPayment.declined',
      alreadyPaid: 'registerPayment.alreadyPaid',
      bookingNotPending: 'registerPayment.notPending',
      notFound: 'bookings.notFound',
    }), { code: props.booking.reference });
  }
}
</script>

<style scoped>
.card-preview {
  max-width: 22rem;
  aspect-ratio: 1.586;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem 1.4rem;
  border-radius: var(--p-border-radius-xl);
  background-color: var(--ss-navy);
  color: #ffffff;
  box-sizing: border-box;
}

.card-preview__chip {
  width: 2.5rem;
  height: 1.875rem;
  border-radius: 0.375rem;
  background-color: var(--p-primary-color);
}

.card-preview__brand {
  font-family: var(--ss-font-display);
  font-weight: 800;
  font-size: 1.125rem;
  min-height: 1.5rem;
}

.card-preview__number {
  font-size: clamp(1rem, 4.5vw, 1.35rem);
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.card-preview__label {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.65);
}

.card-preview__value {
  display: block;
  font-weight: 600;
}

.card-preview__holder {
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
</style>
