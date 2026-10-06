<template>
  <form class="thermostat" novalidate @submit.prevent="submit">
    <div class="field">
      <label :for="`target-${roomId}`">{{ t('climate.thermostat.target') }}</label>
      <pv-input-number
          v-model="form.targetTemperature"
          :input-id="`target-${roomId}`"
          :min="THERMOSTAT_RANGE.min"
          :max="THERMOSTAT_RANGE.max"
          :step="THERMOSTAT_RANGE.step"
          :min-fraction-digits="0"
          :max-fraction-digits="1"
          suffix=" °C"
          show-buttons
          :invalid="!!fieldError"
          :aria-describedby="`target-error-${roomId}`"
      />
      <small class="field-hint">{{ t('climate.thermostat.range', { min: THERMOSTAT_RANGE.min, max: THERMOSTAT_RANGE.max }) }}</small>
      <small v-if="fieldError" :id="`target-error-${roomId}`" class="field-error">{{ fieldError }}</small>
    </div>

    <div class="field">
      <span :id="`fan-${roomId}`" class="block mb-2">{{ t('climate.thermostat.fanSpeed') }}</span>
      <pv-select-button
          v-model="form.fanSpeed"
          :options="fanOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          :aria-labelledby="`fan-${roomId}`"
      />
    </div>

    <pv-button
        type="submit"
        :label="t('climate.thermostat.apply')"
        icon="pi pi-send"
        :loading="saving"
        :disabled="disabled"
    />
  </form>
</template>

<script setup>
import { reactive, computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SetThermostatCommand, FAN_SPEED_ORDER, FanSpeed, THERMOSTAT_RANGE } from '../../domain/commands/set-thermostat.command.js';

/**
 * US-11: the thermostat of one room. It only validates and emits the command; the parent view talks
 * to the store, so this component works both in the guest view and on the operations board.
 */
const props = defineProps({
  roomId: { type: Number, required: true },
  /** Current temperature of the board, used as the starting point of the form. */
  currentTemperature: { type: Number, default: null },
  saving: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['submit']);

const { t } = useI18n();

const DEFAULT_TARGET = 22;

const form = reactive({
  targetTemperature: props.currentTemperature ?? DEFAULT_TARGET,
  fanSpeed: FanSpeed.MEDIUM,
});
const fieldError = ref('');

// The board may refresh while the form is open (another device, a telemetry injection): follow the
// new reading only while the guest has not typed a target of their own. `syncing` keeps the
// programmatic assignment below from counting as the guest touching the field.
const untouched = ref(true);
let syncing = false;

watch(() => props.currentTemperature, (value) => {
  if (!untouched.value || value == null) return;
  syncing = true;
  form.targetTemperature = value;
});

watch(() => form.targetTemperature, () => {
  if (syncing) {
    syncing = false;
    return;
  }
  untouched.value = false;
});

const fanOptions = computed(() => FAN_SPEED_ORDER.map((value) => ({ value, label: t(`climate.fanSpeed.${value}`) })));

function submit() {
  const command = new SetThermostatCommand(form);
  const violation = command.validate();
  fieldError.value = violation ? t(`climate.rules.${violation.code}`, violation.params ?? {}) : '';
  if (violation) return;
  untouched.value = true;
  emit('submit', command);
}
</script>

<style scoped>
.thermostat {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
}
.field-hint {
  color: var(--p-text-muted-color);
  margin-top: 0.25rem;
}
.field-error {
  color: var(--p-red-600);
  margin-top: 0.25rem;
}
</style>
