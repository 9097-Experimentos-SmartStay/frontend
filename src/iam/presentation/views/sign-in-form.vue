<template>
  <AuthLayout :title="t('auth.signInTitle')" :headline="t('login.title')">
    <template #actions>
      <router-link :to="{ name: 'register' }">
        <pv-button :label="t('nav.register')" class="p-button-secondary p-button-outlined" />
      </router-link>
    </template>

    <pv-message v-if="noticeKey" severity="success" class="mb-3">{{ t(noticeKey) }}</pv-message>
    <pv-message v-if="reasonKey && !failure" severity="warn" class="mb-3">{{ t(reasonKey) }}</pv-message>

    <form class="auth-form" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="email">{{ t('auth.emailLabel') }}</label>
        <pv-input-text
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="username"
            :placeholder="t('auth.emailPlaceholder')"
            :invalid="!!errors.email"
            aria-describedby="email-error"
        />
        <small v-if="errors.email" id="email-error" class="field-error">{{ errors.email }}</small>
      </div>

      <div class="field">
        <label for="password">{{ t('auth.passwordLabel') }}</label>
        <pv-password
            v-model="form.password"
            input-id="password"
            toggle-mask
            :feedback="false"
            autocomplete="current-password"
            :placeholder="t('auth.passwordPlaceholder')"
            :invalid="!!errors.password"
        />
        <small v-if="errors.password" class="field-error">{{ errors.password }}</small>
      </div>

      <div class="field flex align-items-start gap-2">
        <pv-checkbox v-model="form.rememberMe" input-id="rememberMe" binary />
        <div>
          <label for="rememberMe" class="m-0 cursor-pointer">{{ t('auth.rememberMe') }}</label>
          <small class="field-hint">{{ t('auth.rememberMeHint') }}</small>
        </div>
      </div>

      <pv-message v-if="failure" severity="error" class="mb-3">
        {{ failureText }}
        <router-link
            v-if="isLocked"
            :to="{ name: 'forgot-password', query: { email: form.email } }"
            class="block mt-2 font-semibold"
        >{{ t('auth.resetPasswordAction') }}</router-link>
        <template v-if="needsVerification">
          <span v-if="verificationSent" class="block mt-2 font-semibold">{{ t('auth.verifyEmail.resent') }}</span>
          <pv-button
              v-else
              :label="t('auth.verificationBanner.resend')"
              icon="pi pi-envelope"
              class="p-button-sm p-button-outlined mt-2"
              :loading="resending"
              @click="resendVerification"
          />
        </template>
      </pv-message>

      <pv-button type="submit" :label="t('auth.signInButton')" class="w-full" :loading="loading" />
    </form>

    <div class="auth-links">
      <router-link :to="{ name: 'forgot-password', query: form.email ? { email: form.email } : {} }">
        {{ t('auth.forgotPasswordLink') }}
      </router-link>
      <router-link :to="{ name: 'register' }">{{ t('auth.registerLink') }}</router-link>
    </div>
  </AuthLayout>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthLayout from '../components/auth-layout.vue';
import useIamStore, { SignInStatus } from '../../application/iam.store.js';
import { AuthFailure, AuthFailureReason } from '../../application/auth-failure.js';
import { SignInCommand } from '../../domain/commands/sign-in.command.js';
import { AccountRuleError, collectErrors, validateEmail, validatePasswordPresent } from '../../domain/model/account-rules.js';
import { authFailureMessage, serverFieldMessages, validationMessages } from '../utils/auth-messages.js';
import { safeRedirect } from '../utils/safe-redirect.js';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const form = reactive({ email: '', password: '', rememberMe: false });
const errors = ref({});
const failure = ref(null);
const loading = ref(false);

const SESSION_END_REASONS = [
  'session-expired',
  'session-revoked',
  'permissions-changed',
  'password-changed',
  'signed-out-everywhere',
  'mfa-reset',
  'hotel-registered',
  'account-deactivated',
  'mfa-expired',
];

/** Why the user landed here: session ended by the API (?reason=) or a finished flow (?notice=). */
const reasonKey = computed(() => {
  const reason = route.query.reason;
  return SESSION_END_REASONS.includes(reason) ? `auth.reasons.${reason}` : null;
});
const noticeKey = computed(() => {
  const notice = route.query.notice;
  return ['password-updated', 'email-verified', 'signed-out-everywhere'].includes(notice) ? `auth.notices.${notice}` : null;
});

const isLocked = computed(() => failure.value?.reason === AuthFailureReason.ACCOUNT_LOCKED);
const needsVerification = computed(() => failure.value?.reason === AuthFailureReason.EMAIL_NOT_VERIFIED);
const resending = ref(false);
const verificationSent = ref(false);
const failureText = computed(() => (failure.value ? authFailureMessage(t, locale.value, failure.value) : ''));

function validate() {
  const codes = collectErrors({
    email: () => validateEmail(form.email),
    password: () => validatePasswordPresent(form.password),
  });
  errors.value = validationMessages(t, codes);
  return Object.keys(codes).length === 0;
}


/** Sign-in requires a verified e-mail: offer a new verification link right there. */
async function resendVerification() {
  resending.value = true;
  try {
    await iamStore.resendVerification(form.email.trim());
    verificationSent.value = true;
  } catch (error) {
    failure.value = AuthFailure.from(error);
  } finally {
    resending.value = false;
  }
}

async function submit() {
  failure.value = null;
  verificationSent.value = false;
  if (!validate()) return;

  loading.value = true;
  try {
    const outcome = await iamStore.signIn(new SignInCommand(form));
    const redirect = safeRedirect(route.query.redirect);
    if (outcome.status === SignInStatus.SECOND_FACTOR_REQUIRED) {
      // Staff (US-52): set up the authenticator app the first time, enter a code afterwards.
      await router.push({
        name: outcome.challenge.requiresEnrollment ? 'mfa-enrollment' : 'mfa-verification',
        query: redirect ? { redirect } : {},
      });
      return;
    }
    // The guard sends a redirect the role cannot open back to the role's own dashboard.
    await router.push(redirect ?? { name: 'dashboard' });
  } catch (error) {
    const authFailure = AuthFailure.from(error);
    const fieldMessages = serverFieldMessages(t, authFailure, {
      email: { code: AccountRuleError.EMAIL_FORMAT },
      password: { code: AccountRuleError.REQUIRED },
    });
    if (Object.keys(fieldMessages).length > 0) {
      errors.value = fieldMessages;
    } else {
      failure.value = authFailure;
    }
  } finally {
    loading.value = false;
  }
}
</script>
