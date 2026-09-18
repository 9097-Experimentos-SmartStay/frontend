<template>
  <pv-input-otp
      :model-value="modelValue"
      :length="length"
      integer-only
      :invalid="invalid"
      role="group"
      :aria-labelledby="labelledBy"
      @update:model-value="(value) => emit('update:modelValue', value)"
      @change="(event) => emit('change', event)"
  >
    <template #default="{ attrs, events, index }">
      <input
          type="text"
          inputmode="numeric"
          maxlength="1"
          :autocomplete="index === 1 ? 'one-time-code' : 'off'"
          class="p-inputtext p-component p-inputotp-input"
          :class="{ 'p-invalid': invalid }"
          :aria-label="t('auth.mfa.digitLabel', { position: index, total: length })"
          :aria-invalid="invalid || undefined"
          :aria-describedby="describedBy || undefined"
          v-bind="attrs"
          v-on="events"
      />
    </template>
  </pv-input-otp>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

/**
 * The digits of an authenticator code (US-52), one box per digit. Each box has its own accessible name
 * ("Dígito 1 de 6"...) so screen readers announce where the user is.
 */
defineProps({
  modelValue: { type: String, default: '' },
  length: { type: Number, required: true },
  invalid: { type: Boolean, default: false },
  /** Id of the visible label of the group. */
  labelledBy: { type: String, default: undefined },
  /** Id of the hint or error of the field. */
  describedBy: { type: String, default: undefined },
});

const emit = defineEmits(['update:modelValue', 'change']);
const { t } = useI18n();
</script>
