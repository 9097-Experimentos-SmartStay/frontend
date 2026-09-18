<template>
  <div class="recovery-codes">
    <pv-message severity="warn" class="mb-3">{{ t('auth.mfa.recovery.warning') }}</pv-message>

    <ol class="codes" :aria-label="t('auth.mfa.recovery.listLabel')">
      <li v-for="code in recoveryCodes.codes" :key="code"><code>{{ code }}</code></li>
    </ol>

    <div class="flex flex-wrap gap-2 mb-3">
      <pv-button :label="copied ? t('auth.mfa.recovery.copied') : t('auth.mfa.recovery.copy')" :icon="copied ? 'pi pi-check' : 'pi pi-copy'" class="p-button-outlined p-button-sm" @click="copy" />
      <pv-button :label="t('auth.mfa.recovery.download')" icon="pi pi-download" class="p-button-outlined p-button-sm" @click="download" />
    </div>

    <div class="flex align-items-start gap-2 mb-3">
      <pv-checkbox v-model="saved" input-id="codesSaved" binary />
      <label for="codesSaved" class="cursor-pointer">{{ t('auth.mfa.recovery.saved') }}</label>
    </div>

    <pv-button :label="t('auth.mfa.recovery.continue')" icon="pi pi-arrow-right" icon-pos="right" class="w-full" :disabled="!saved" @click="emit('done')" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Shows the 10 recovery codes ONCE (US-52 scenario 3): the backend never returns them again.
 * The user copies or downloads them and must confirm they saved them before continuing.
 */
const props = defineProps({
  /** @type {import('../../domain/model/totp-enrollment.js').RecoveryCodes} */
  recoveryCodes: { type: Object, required: true },
  email: { type: String, default: '' },
});
const emit = defineEmits(['done']);
const { t, locale } = useI18n();

const saved = ref(false);
const copied = ref(false);

function asText() {
  const header = t('auth.mfa.recovery.fileHeader', {
    email: props.email,
    date: new Date().toLocaleString(locale.value),
  });
  return props.recoveryCodes.toText(header);
}

async function copy() {
  try {
    await navigator.clipboard.writeText(asText());
    copied.value = true;
  } catch {
    copied.value = false;
  }
}

function download() {
  const url = URL.createObjectURL(new Blob([asText()], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'smartstay-codigos-de-recuperacion.txt';
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.codes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 1.5rem;
  padding: 1rem 1rem 1rem 2.25rem;
  margin: 0 0 1rem;
  background: #f8fafc;
  border: 1px dashed #94a3b8;
  border-radius: 8px;
}
.codes code {
  font-size: 1rem;
  letter-spacing: 0.08em;
  color: #0f172a;
}
</style>
