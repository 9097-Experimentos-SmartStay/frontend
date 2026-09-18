<template>
  <AuthLayout :title="recoveryCodes ? t('auth.mfa.recovery.title') : t('auth.mfa.enrollment.title')" :subtitle="subtitle">
    <!-- Step 3: the session exists; the codes are shown once -->
    <RecoveryCodesPanel v-if="recoveryCodes" :recovery-codes="recoveryCodes" :email="email" @done="finish" />

    <template v-else-if="expired">
      <pv-message severity="warn" class="mb-3">{{ t('auth.mfa.errors.challengeExpired') }}</pv-message>
      <pv-button :label="t('auth.backToLogin')" icon="pi pi-arrow-left" class="w-full" @click="backToLogin" />
    </template>

    <template v-else>
      <!-- Step 1: scan the QR code (or type the secret) -->
      <ol class="steps">
        <li>{{ t('auth.mfa.enrollment.stepInstall') }}</li>
        <li>{{ t('auth.mfa.enrollment.stepScan') }}</li>
        <li>{{ t('auth.mfa.enrollment.stepCode') }}</li>
      </ol>

      <div class="flex flex-column align-items-center gap-2 mb-3">
        <TotpQrCode
            v-if="enrollment"
            :value="enrollment.otpAuthUri"
            :alt="t('auth.mfa.enrollment.qrAlt')"
            :fallback="t('auth.mfa.enrollment.qrFailed')"
        />
        <pv-skeleton v-else-if="loadingEnrollment" width="200px" height="200px" />
      </div>

      <div v-if="enrollment" class="manual-secret mb-3">
        <small class="block text-color-secondary mb-1">{{ t('auth.mfa.enrollment.manualEntry') }}</small>
        <div class="flex align-items-center gap-2">
          <code class="secret">{{ enrollment.groupedSecret }}</code>
          <pv-button
              :icon="secretCopied ? 'pi pi-check' : 'pi pi-copy'"
              class="p-button-text p-button-sm"
              :aria-label="t('auth.mfa.enrollment.copySecret')"
              v-tooltip.top="t('auth.mfa.enrollment.copySecret')"
              @click="copySecret"
          />
        </div>
        <small class="block text-color-secondary mt-1">{{ t('auth.mfa.enrollment.manualDetails', { account: enrollment.accountName, period: enrollment.period, digits: enrollment.digits }) }}</small>
      </div>

      <!-- Step 2: confirm with the first code -->
      <form v-if="enrollment" class="auth-form" novalidate @submit.prevent="confirm">
        <div class="field">
          <label for="enrollment-code" class="block mb-2">{{ t('auth.mfa.codeLabel') }}</label>
          <pv-input-otp v-model="code" :length="AUTHENTICATOR_CODE_LENGTH" integer-only :invalid="!!codeError" aria-describedby="enrollment-code-error" />
          <small v-if="codeError" id="enrollment-code-error" class="field-error">{{ codeError }}</small>
        </div>

        <pv-message v-if="failureText" severity="error" class="mb-3">{{ failureText }}</pv-message>
        <pv-button type="submit" :label="t('auth.mfa.enrollment.submit')" icon="pi pi-shield" class="w-full" :loading="confirming" />
      </form>

      <pv-message v-else-if="failureText" severity="error" class="mb-3">
        {{ failureText }}
        <pv-button :label="t('common.retry')" class="p-button-sm p-button-outlined mt-2 block" @click="loadEnrollment" />
      </pv-message>

      <div class="auth-links">
        <a href="#" @click.prevent="backToLogin">{{ t('auth.backToLogin') }}</a>
      </div>
    </template>
  </AuthLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthLayout from '../components/auth-layout.vue';
import TotpQrCode from '../components/totp-qr-code.vue';
import RecoveryCodesPanel from '../components/recovery-codes-panel.vue';
import useIamStore from '../../application/iam.store.js';
import { AuthFailure, AuthFailureReason } from '../../application/auth-failure.js';
import { ConfirmMfaEnrollmentCommand } from '../../domain/commands/verify-second-factor.command.js';
import { AUTHENTICATOR_CODE_LENGTH } from '../../domain/model/second-factor.js';
import { authFailureMessage } from '../utils/auth-messages.js';
import { safeRedirect } from '../utils/safe-redirect.js';

/**
 * US-52 scenario 1: a staff member without an authenticator app sets it up before entering the system.
 * Scan the QR (or type the secret) → confirm with a 6-digit code → save the 10 recovery codes.
 */
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const enrollment = ref(null);
const loadingEnrollment = ref(false);
const code = ref('');
const codeError = ref('');
const failure = ref(null);
const confirming = ref(false);
const recoveryCodes = ref(null);
const secretCopied = ref(false);
const expired = ref(false);
const email = ref(iamStore.pendingChallenge?.email ?? '');

const failureText = computed(() => (failure.value ? authFailureMessage(t, locale.value, failure.value) : ''));
const subtitle = computed(() => {
  if (recoveryCodes.value) return t('auth.mfa.recovery.subtitle');
  return iamStore.pendingChallenge?.rememberMe
    ? `${t('auth.mfa.enrollment.subtitle')} ${t('auth.mfa.rememberMeKept')}`
    : t('auth.mfa.enrollment.subtitle');
});

function handleFailure(error) {
  const authFailure = AuthFailure.from(error);
  if (authFailure.reason === AuthFailureReason.MFA_CHALLENGE_EXPIRED) {
    expired.value = true;
    return;
  }
  failure.value = authFailure;
}

async function loadEnrollment() {
  failure.value = null;
  loadingEnrollment.value = true;
  try {
    enrollment.value = await iamStore.startMfaEnrollment();
  } catch (error) {
    handleFailure(error);
  } finally {
    loadingEnrollment.value = false;
  }
}

async function copySecret() {
  try {
    await navigator.clipboard.writeText(enrollment.value.secret);
    secretCopied.value = true;
  } catch {
    secretCopied.value = false;
  }
}

async function confirm() {
  failure.value = null;
  const command = new ConfirmMfaEnrollmentCommand({ code: code.value });
  const violation = command.validate();
  codeError.value = violation ? t(`validation.${violation.code}`) : '';
  if (violation) return;

  confirming.value = true;
  try {
    recoveryCodes.value = await iamStore.confirmMfaEnrollment(command);
  } catch (error) {
    code.value = '';
    handleFailure(error);
  } finally {
    confirming.value = false;
  }
}

function finish() {
  router.push(safeRedirect(route.query.redirect) ?? { name: 'dashboard' });
}

function backToLogin() {
  iamStore.abandonSecondFactor();
  router.push({ name: 'login' });
}

onMounted(() => {
  if (!iamStore.pendingChallenge?.requiresEnrollment) {
    // Reloaded or opened directly: the mfaToken lives in memory only.
    router.replace({ name: 'login', query: { reason: 'mfa-expired' } });
    return;
  }
  loadEnrollment();
});
</script>

<style scoped>
.steps {
  padding-left: 1.25rem;
  margin: 0 0 1rem;
  line-height: 1.6;
  color: #334155;
}
.manual-secret .secret {
  font-size: 1rem;
  letter-spacing: 0.08em;
  background: #f1f5f9;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  word-break: break-all;
}
</style>
