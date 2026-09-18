<template>
  <AuthLayout :title="t('auth.mfa.verification.title')" :subtitle="subtitle">
    <template v-if="expired">
      <pv-message severity="warn" class="mb-3">{{ t('auth.mfa.errors.challengeExpired') }}</pv-message>
      <pv-button :label="t('auth.backToLogin')" icon="pi pi-arrow-left" class="w-full" @click="backToLogin" />
    </template>

    <form v-else class="auth-form" novalidate @submit.prevent="submit">
      <div v-if="!usesRecoveryCode" class="field">
        <label class="block mb-2">{{ t('auth.mfa.codeLabel') }}</label>
        <pv-input-otp v-model="code" :length="AUTHENTICATOR_CODE_LENGTH" integer-only :invalid="!!fieldError" @change="onCodeChange" />
        <small class="field-hint">{{ t('auth.mfa.verification.codeHint') }}</small>
      </div>

      <div v-else class="field">
        <label for="recovery-code">{{ t('auth.mfa.verification.recoveryCodeLabel') }}</label>
        <pv-input-text
            id="recovery-code"
            v-model="recoveryCode"
            autocomplete="one-time-code"
            autocapitalize="characters"
            spellcheck="false"
            :placeholder="t('auth.mfa.verification.recoveryCodePlaceholder')"
            :invalid="!!fieldError"
        />
        <small class="field-hint">{{ t('auth.mfa.verification.recoveryCodeHint') }}</small>
      </div>
      <small v-if="fieldError" class="field-error mb-3" role="alert">{{ fieldError }}</small>

      <pv-message v-if="failure" severity="error" class="mb-3">
        {{ failureText }}
        <router-link
            v-if="isLocked"
            :to="{ name: 'forgot-password', query: { email: challengeEmail } }"
            class="block mt-2 font-semibold"
        >{{ t('auth.resetPasswordAction') }}</router-link>
      </pv-message>

      <pv-button type="submit" :label="t('auth.mfa.verification.submit')" icon="pi pi-sign-in" class="w-full" :loading="loading" :disabled="isLocked" />

      <div class="auth-links">
        <a href="#" @click.prevent="toggleMethod">
          {{ usesRecoveryCode ? t('auth.mfa.verification.useAuthenticator') : t('auth.mfa.verification.useRecoveryCode') }}
        </a>
        <a href="#" @click.prevent="backToLogin">{{ t('auth.backToLogin') }}</a>
      </div>
    </form>
  </AuthLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthLayout from '../components/auth-layout.vue';
import useIamStore from '../../application/iam.store.js';
import { AuthFailure, AuthFailureReason } from '../../application/auth-failure.js';
import { SecondFactorMethod, VerifySecondFactorCommand } from '../../domain/commands/verify-second-factor.command.js';
import { AUTHENTICATOR_CODE_LENGTH } from '../../domain/model/second-factor.js';
import { authFailureMessage } from '../utils/auth-messages.js';
import { safeRedirect } from '../utils/safe-redirect.js';

/**
 * US-52 scenarios 2 and 3: second step of a staff sign-in with the 6-digit code of the authenticator app,
 * or with one of the single-use recovery codes. Wrong codes count toward the account lock (US-02).
 */
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const code = ref('');
const recoveryCode = ref('');
const usesRecoveryCode = ref(false);
const fieldError = ref('');
const failure = ref(null);
const loading = ref(false);
const expired = ref(false);
const challengeEmail = iamStore.pendingChallenge?.email ?? '';

const isLocked = computed(() => failure.value?.reason === AuthFailureReason.ACCOUNT_LOCKED);
const failureText = computed(() => (failure.value ? authFailureMessage(t, locale.value, failure.value) : ''));
const subtitle = computed(() => {
  const base = t('auth.mfa.verification.subtitle', { email: challengeEmail });
  return iamStore.pendingChallenge?.rememberMe ? `${base} ${t('auth.mfa.rememberMeKept')}` : base;
});

function toggleMethod() {
  usesRecoveryCode.value = !usesRecoveryCode.value;
  fieldError.value = '';
  failure.value = null;
}

/** Sends the code as soon as the sixth digit is typed. */
function onCodeChange({ value }) {
  if (String(value ?? '').length === AUTHENTICATOR_CODE_LENGTH && !loading.value) submit();
}

async function submit() {
  failure.value = null;
  const command = new VerifySecondFactorCommand({
    method: usesRecoveryCode.value ? SecondFactorMethod.RECOVERY_CODE : SecondFactorMethod.AUTHENTICATOR_CODE,
    value: usesRecoveryCode.value ? recoveryCode.value : code.value,
  });
  const violation = command.validate();
  fieldError.value = violation ? t(`validation.${violation.code}`) : '';
  if (violation) return;

  loading.value = true;
  try {
    await iamStore.verifySecondFactor(command);
    await router.push(safeRedirect(route.query.redirect) ?? { name: 'dashboard' });
  } catch (error) {
    const authFailure = AuthFailure.from(error);
    if (authFailure.reason === AuthFailureReason.MFA_CHALLENGE_EXPIRED) {
      expired.value = true;
    } else {
      failure.value = authFailure;
      code.value = '';
    }
  } finally {
    loading.value = false;
  }
}

function backToLogin() {
  iamStore.abandonSecondFactor();
  router.push({ name: 'login' });
}

onMounted(() => {
  const challenge = iamStore.pendingChallenge;
  if (!challenge || challenge.requiresEnrollment) {
    // Reloaded or opened directly: the mfaToken lives in memory only.
    router.replace({ name: 'login', query: { reason: 'mfa-expired' } });
  }
});
</script>
