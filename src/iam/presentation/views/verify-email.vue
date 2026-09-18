<template>
  <AuthLayout :title="t('auth.verifyEmail.title')">
    <div v-if="state === 'verifying'" class="flex flex-column align-items-center gap-3 py-4">
      <pv-progress-spinner style="width: 3rem; height: 3rem" />
      <span>{{ t('auth.verifyEmail.verifying') }}</span>
    </div>

    <div v-else-if="state === EmailVerificationResult.VERIFIED" class="auth-form">
      <div class="flex align-items-center gap-3 mb-3">
        <i class="pi pi-check-circle text-green-600 text-4xl"></i>
        <div>
          <h3 class="m-0">{{ t('auth.verifyEmail.verifiedTitle') }}</h3>
          <p class="m-0 mt-1 text-600">{{ t('auth.verifyEmail.verifiedMessage') }}</p>
        </div>
      </div>
      <pv-button :label="continueLabel" class="w-full" @click="continueAfterVerification" />
    </div>

    <!-- Expired (410) or invalid/used (400) link: ask for a new one -->
    <div v-else class="auth-form">
      <pv-message :severity="state === EmailVerificationResult.EXPIRED ? 'warn' : 'error'" class="mb-3">
        <strong class="block mb-1">{{ t(`auth.verifyEmail.${state}Title`) }}</strong>
        {{ t(`auth.verifyEmail.${state}Message`) }}
      </pv-message>

      <pv-message v-if="resent" severity="success" class="mb-3">{{ t('auth.verifyEmail.resent') }}</pv-message>

      <form novalidate @submit.prevent="resend">
        <div class="field">
          <label for="email">{{ t('auth.emailLabel') }}</label>
          <pv-input-text id="email" v-model="email" type="email" autocomplete="email" :invalid="!!emailError" />
          <small v-if="emailError" class="field-error">{{ emailError }}</small>
        </div>
        <pv-message v-if="resendError" severity="error" class="mb-3">{{ resendError }}</pv-message>
        <pv-button type="submit" :label="t('auth.verifyEmail.resendButton')" class="w-full" :loading="resending" />
      </form>

      <div class="auth-links">
        <router-link :to="{ name: 'login' }">{{ t('auth.backToLogin') }}</router-link>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthLayout from '../components/auth-layout.vue';
import useIamStore, { EmailVerificationResult } from '../../application/iam.store.js';
import { validateEmail } from '../../domain/model/account-rules.js';
import { authFailureMessage } from '../utils/auth-messages.js';

/**
 * Target of the link in the verification e-mail: /verify-email?token=... (US-01).
 */
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const state = ref('verifying');
const email = ref(iamStore.currentUser?.email ?? '');
const emailError = ref('');
const resending = ref(false);
const resent = ref(false);
const resendError = ref('');

const continueLabel = computed(() => (iamStore.isSignedIn ? t('auth.verifyEmail.continue') : t('auth.goToLogin')));

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : '';
  if (!token) {
    state.value = EmailVerificationResult.INVALID;
    return;
  }
  try {
    state.value = await iamStore.verifyEmail(token);
  } catch (error) {
    state.value = EmailVerificationResult.INVALID;
    resendError.value = authFailureMessage(t, locale.value, error);
  }
});

function continueAfterVerification() {
  router.push(iamStore.isSignedIn ? { name: 'dashboard' } : { name: 'login', query: { notice: 'email-verified' } });
}

async function resend() {
  resent.value = false;
  resendError.value = '';
  const violation = validateEmail(email.value);
  emailError.value = violation ? t(`validation.${violation.code}`) : '';
  if (violation) return;

  resending.value = true;
  try {
    await iamStore.resendVerification(email.value.trim());
    resent.value = true;
  } catch (error) {
    resendError.value = authFailureMessage(t, locale.value, error);
  } finally {
    resending.value = false;
  }
}
</script>
