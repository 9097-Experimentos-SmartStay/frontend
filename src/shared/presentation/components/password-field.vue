<template>
  <div class="password-field">
    <div class="field">
      <label :for="inputId">{{ label }} *</label>
      <pv-password
          :model-value="modelValue"
          :input-id="inputId"
          toggle-mask
          :feedback="false"
          autocomplete="new-password"
          :invalid="!!error"
          :aria-describedby="`${inputId}-requirements`"
          @update:model-value="emit('update:modelValue', $event ?? '')"
      />
      <small v-if="error" class="field-error" role="alert">{{ error }}</small>

      <div v-if="modelValue" class="strength" :class="`strength-${strength}`" aria-live="polite">
        <div class="strength-bar"><span :style="{ width: strengthWidth }"></span></div>
        <small>{{ t(`passwordField.strength.${strength}`) }}</small>
      </div>

      <ul :id="`${inputId}-requirements`" class="requirements">
        <li :class="{ met: meetsMin }">
          <i :class="meetsMin ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
          {{ t('passwordField.minLength', { min: minLength, count: length }) }}
        </li>
        <li v-if="length > maxLength" class="unmet">
          <i class="pi pi-times-circle"></i>
          {{ t('passwordField.maxLength', { max: maxLength }) }}
        </li>
        <li class="info">
          <i class="pi pi-info-circle"></i>
          {{ t('passwordField.noBreached') }}
        </li>
      </ul>
      <small class="field-hint">{{ t('passwordField.hint') }}</small>
    </div>

    <div v-if="withConfirmation" class="field">
      <label :for="`${inputId}-confirmation`">{{ t('passwordField.confirmLabel') }} *</label>
      <pv-password
          :model-value="confirmation"
          :input-id="`${inputId}-confirmation`"
          toggle-mask
          :feedback="false"
          autocomplete="new-password"
          :invalid="!!confirmationError"
          @update:model-value="emit('update:confirmation', $event ?? '')"
      />
      <small v-if="confirmationError" class="field-error" role="alert">{{ confirmationError }}</small>
      <small v-else-if="confirmation && confirmation === modelValue" class="field-hint matches">
        <i class="pi pi-check"></i> {{ t('passwordField.matches') }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * New-password input with confirmation, live requirement checklist, strength meter and show/hide.
 *
 * The limits come from the caller (the IAM password policy), so this component holds no business rule.
 * Pasting is allowed (password managers). There are no composition rules: the meter rewards length,
 * and the backend rejects breached or common passwords (its field error arrives through `error`).
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  confirmation: { type: String, default: '' },
  minLength: { type: Number, required: true },
  maxLength: { type: Number, required: true },
  label: { type: String, required: true },
  error: { type: String, default: '' },
  confirmationError: { type: String, default: '' },
  withConfirmation: { type: Boolean, default: true },
  inputId: { type: String, default: 'new-password' },
});
const emit = defineEmits(['update:modelValue', 'update:confirmation']);
const { t } = useI18n();

/** Unicode code points, like the policy counts them. */
const length = computed(() => [...(props.modelValue ?? '')].length);
const meetsMin = computed(() => length.value >= props.minLength);

/**
 * Length-first heuristic (UI hint only): below the minimum is weak; a long passphrase or a
 * moderately long password with some variety is strong.
 */
const strength = computed(() => {
  if (!meetsMin.value || length.value > props.maxLength) return 'weak';
  const value = props.modelValue;
  const variety = [/\p{Ll}/u, /\p{Lu}/u, /\d/, /[^\p{L}\d]/u].filter((re) => re.test(value)).length;
  const longEnough = length.value >= Math.max(props.minLength + 5, 16);
  if (length.value >= 20 || (longEnough && variety >= 2)) return 'strong';
  return 'medium';
});
const strengthWidth = computed(() => ({ weak: '33%', medium: '66%', strong: '100%' })[strength.value]);
</script>

<style scoped>
.password-field :deep(.p-password),
.password-field :deep(.p-password-input) {
  width: 100%;
}
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
}
.field-error {
  color: #c62828;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.25rem;
}
.field-hint {
  color: #64748b;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.25rem;
}
.matches {
  color: #2e7d32;
}
.strength {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.strength-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}
.strength-bar span {
  display: block;
  height: 100%;
  transition: width 0.2s ease;
}
.strength small {
  font-weight: 600;
  font-size: 0.8rem;
  min-width: 7rem;
}
.strength-weak .strength-bar span { background: #c62828; }
.strength-weak small { color: #c62828; }
.strength-medium .strength-bar span { background: #b26a00; }
.strength-medium small { color: #b26a00; }
.strength-strong .strength-bar span { background: #2e7d32; }
.strength-strong small { color: #2e7d32; }
.requirements {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #64748b;
}
.requirements li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.2rem;
}
.requirements li.met {
  color: #2e7d32;
}
.requirements li.unmet {
  color: #c62828;
}
</style>
