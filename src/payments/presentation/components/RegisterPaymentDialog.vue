<template>
  <pv-dialog
      :visible="visible"
      modal
      :header="booking ? t('registerPayment.title', { code: booking.reference }) : ''"
      :style="{ width: '32rem' }"
      :breakpoints="{ '640px': '95vw' }"
      @update:visible="emit('update:visible', $event)"
      @show="reset"
  >
    <div v-if="booking" class="surface-ground border-round p-3 mb-3">
      <div class="flex justify-content-between mb-2">
        <span class="text-color-secondary">{{ t('staffBookings.guest') }}</span>
        <span class="font-medium">{{ booking.guestName }}</span>
      </div>
      <div class="flex justify-content-between mb-2">
        <span class="text-color-secondary">{{ t('staffBookings.room') }}</span>
        <span class="font-medium">{{ booking.roomLabel }} · {{ t('stay.nights', { count: booking.nights }, booking.nights) }}</span>
      </div>
      <div class="flex justify-content-between">
        <span class="text-color-secondary">{{ t('payments.amount') }}</span>
        <span class="font-bold text-lg">{{ formatMoney(booking.total, locale) }}</span>
      </div>
      <small class="block mt-2 text-color-secondary">{{ t('registerPayment.amountNote') }}</small>
    </div>

    <form class="p-fluid" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="rp-method" class="font-medium block mb-2">{{ t('registerPayment.method') }} *</label>
        <pv-select
            v-model="form.method"
            input-id="rp-method"
            :options="methodOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('registerPayment.methodPlaceholder')"
            :invalid="!!errors.method"
        />
        <small v-if="errors.method" class="p-error">{{ errors.method }}</small>
      </div>

      <div v-if="needsOperationNumber" class="field">
        <label for="rp-operation" class="font-medium block mb-2">{{ t('registerPayment.operationNumber') }} *</label>
        <pv-input-text id="rp-operation" v-model="form.operationNumber" :maxlength="OPERATION_NUMBER_MAX_LENGTH" :invalid="!!errors.operationNumber" />
        <small v-if="errors.operationNumber" class="p-error">{{ errors.operationNumber }}</small>
      </div>

      <div class="field">
        <label for="rp-note" class="font-medium block mb-2">{{ t('registerPayment.note') }}</label>
        <pv-textarea id="rp-note" v-model="form.note" rows="2" auto-resize :maxlength="PAYMENT_NOTE_MAX_LENGTH" :invalid="!!errors.note" />
        <small v-if="errors.note" class="p-error">{{ errors.note }}</small>
        <small v-else class="text-color-secondary">{{ form.note.length }} / {{ PAYMENT_NOTE_MAX_LENGTH }}</small>
      </div>

      <pv-message v-if="errorMessage" severity="error" class="mb-2">{{ errorMessage }}</pv-message>
    </form>

    <template #footer>
      <pv-button :label="t('common.cancel')" class="p-button-text" @click="emit('update:visible', false)" />
      <pv-button :label="t('registerPayment.submit')" icon="pi pi-check" :loading="paymentStore.registering" @click="submit" />
    </template>
  </pv-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePaymentStore } from '../../application/payment.store.js';
import { PaymentMethod, requiresOperationNumber } from '../../domain/model/payment-method.js';
import {
  OPERATION_NUMBER_MAX_LENGTH,
  PAYMENT_NOTE_MAX_LENGTH,
  RegisterPaymentCommand,
} from '../../domain/commands/register-payment.command.js';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey, violationMessages } from '@/shared/presentation/utils/failure-message.js';

/**
 * US-07 scenario 5: the hotel registers how the guest paid (Yape, Plin, bank transfer, cash or card at the front
 * desk) with the operation number (not for cash). The amount is read-only: it is always the booking total.
 * Registering it confirms the booking and e-mails the guest.
 */
const props = defineProps({
  visible: { type: Boolean, default: false },
  /** @type {import('@/bookings/domain/model/booking.entity.js').Booking} */
  booking: { type: Object, default: null },
});
const emit = defineEmits(['update:visible', 'registered']);
const { t, locale } = useI18n();
const paymentStore = usePaymentStore();

const form = reactive({ method: null, operationNumber: '', note: '' });
const errors = ref({});
const errorMessage = ref('');

const methodOptions = computed(() => Object.values(PaymentMethod).map((value) => ({ value, label: t(`paymentMethods.${value}`) })));
const needsOperationNumber = computed(() => requiresOperationNumber(form.method));

function reset() {
  Object.assign(form, { method: null, operationNumber: '', note: '' });
  errors.value = {};
  errorMessage.value = '';
}

async function submit() {
  errorMessage.value = '';
  const command = new RegisterPaymentCommand({ bookingId: props.booking.id, ...form });
  const violations = command.validate();
  errors.value = violationMessages(t, violations, 'registerPayment.rules');
  if (Object.keys(violations).length > 0) return;

  try {
    const payment = await paymentStore.registerPayment(command);
    emit('registered', payment);
    emit('update:visible', false);
  } catch (failure) {
    if (failure.hasFieldViolations) {
      errors.value = violationMessages(t, failure.fieldViolations, 'registerPayment.rules');
      return;
    }
    errorMessage.value = t(failureMessageKey(failure, {
      alreadyPaid: 'registerPayment.alreadyPaid',
      bookingNotPending: 'registerPayment.notPending',
      forbidden: 'registerPayment.forbidden',
      notFound: 'bookings.notFound',
    }), { code: props.booking.reference });
  }
}
</script>
