<template>
  <div class="qr-frame">
    <img v-if="dataUrl" :src="dataUrl" :alt="alt" width="200" height="200" />
    <pv-skeleton v-else-if="!failed" width="200px" height="200px" />
    <small v-else class="text-color-secondary">{{ fallback }}</small>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import QRCode from 'qrcode';

/**
 * Renders an `otpauth://` URI as a QR code, entirely in the browser.
 *
 * Library: `qrcode` (node-qrcode, MIT, maintained, ~13 kB gzipped, loaded only on this page). The URI carries the TOTP
 * secret, so it must never be sent to a remote QR service; generating it locally avoids that. It is rendered as a
 * PNG data URL in an <img> (no v-html). If rendering fails, the page still shows the secret for manual entry.
 */
const props = defineProps({
  value: { type: String, required: true },
  alt: { type: String, required: true },
  fallback: { type: String, default: '' },
});

const dataUrl = ref('');
const failed = ref(false);

watch(() => props.value, async (value) => {
  dataUrl.value = '';
  failed.value = false;
  if (!value) return;
  try {
    dataUrl.value = await QRCode.toDataURL(value, { width: 200, margin: 1, errorCorrectionLevel: 'M' });
  } catch {
    failed.value = true;
  }
}, { immediate: true });
</script>

<style scoped>
.qr-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  min-height: 200px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
}
</style>
