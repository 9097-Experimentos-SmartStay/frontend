<template>
  <pv-message v-if="visible" severity="warn" class="mb-4" closable @close="dismissed = true">
    <div class="flex flex-wrap align-items-center gap-3">
      <span>{{ t('auth.verificationBanner.message', { email: user.email }) }}</span>
      <span v-if="sent" class="font-semibold">{{ t('auth.verificationBanner.resent') }}</span>
      <pv-button
          v-else
          :label="t('auth.verificationBanner.resend')"
          icon="pi pi-envelope"
          class="p-button-sm p-button-outlined"
          :loading="sending"
          @click="resend"
      />
    </div>
  </pv-message>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../application/iam.store.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

/**
 * Reminder for a session whose account has not confirmed its e-mail (since the verified-e-mail rule, §2.3,\n * only a session restored from before that rule can be in this state),
 * with a button to get a new verification link (US-01).
 */
const { t } = useI18n();
const iamStore = useIamStore();

const dismissed = ref(false);
const sending = ref(false);
const sent = ref(false);

const user = computed(() => iamStore.currentUser);
const visible = computed(() => !!user.value && !user.value.emailVerified && !dismissed.value);

async function resend() {
  sending.value = true;
  try {
    await iamStore.resendVerification(user.value.email);
    sent.value = true;
  } catch (error) {
    reportError('Error resending the verification e-mail', error);
  } finally {
    sending.value = false;
  }
}
</script>
