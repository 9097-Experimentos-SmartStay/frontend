<template>
  <AuthLayout
      :title="linkProblem ? t(`auth.resetPassword.${linkProblem}Title`) : t('auth.resetPassword.title')"
      :subtitle="linkProblem ? '' : t('auth.resetPassword.subtitle')"
  >
    <!-- US-04 scenario 3: expired (410) or invalid/used (400) link -->
    <div v-if="linkProblem" class="auth-form">
      <pv-message :severity="linkProblem === 'expired' ? 'warn' : 'error'" class="mb-3">
        {{ t(`auth.resetPassword.${linkProblem}Message`) }}
      </pv-message>
      <pv-button
          :label="t('auth.resetPassword.requestNewLink')"
          icon="pi pi-envelope"
          class="w-full"
          @click="router.push({ name: 'forgot-password' })"
      />
      <div class="auth-links">
        <router-link :to="{ name: 'login' }">{{ t('auth.backToLogin') }}</router-link>
      </div>
    </div>

    <form v-else class="auth-form" novalidate @submit.prevent="submit">
      <PasswordField
          v-model="form.password"
          v-model:confirmation="form.confirmation"
          :min-length="passwordRequirements.minLength"
          :max-length="passwordRequirements.maxLength"
          :error="errors.password"
          :confirmation-error="errors.confirmation"
          :label="t('auth.newPasswordLabel')"
      />
      <pv-message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</pv-message>
      <pv-button type="submit" :label="t('auth.resetPassword.submit')" class="w-full" :loading="loading" />
    </form>
  </AuthLayout>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthLayout from '../components/auth-layout.vue';
import PasswordField from '@/shared/presentation/components/password-field.vue';
import useIamStore from '../../application/iam.store.js';
import { AuthFailure, AuthFailureReason } from '../../application/auth-failure.js';
import { ResetPasswordCommand } from '../../domain/commands/reset-password.command.js';
import { AccountRuleError, collectErrors, validateNewPassword, validatePasswordConfirmation } from '../../domain/model/account-rules.js';
import { passwordRequirementsFor } from '../../domain/model/password-policy.js';
import { authFailureMessage, serverFieldMessages, validationMessages } from '../utils/auth-messages.js';

/**
 * Target of the link in the recovery e-mail: /reset-password?token=... (US-04).
 * On success the user goes to /login with a confirmation message (scenario 4).
 */
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const token = typeof route.query.token === 'string' ? route.query.token : '';
/**
 * The link only carries a token, so the role of the account is unknown here: the lowest minimum of the
 * policy is checked locally and the backend applies the one of the account (its 400 shows under the input).
 */
const passwordRequirements = passwordRequirementsFor(null);
const form = reactive({ password: '', confirmation: '' });
const errors = ref({});
const errorMessage = ref('');
const loading = ref(false);
/** @type {import('vue').Ref<''|'expired'|'invalid'>} */
const linkProblem = ref(token ? '' : 'invalid');

async function submit() {
  errorMessage.value = '';
  const codes = collectErrors({
    password: () => validateNewPassword(form.password, passwordRequirements),
    confirmation: () => validatePasswordConfirmation(form.password, form.confirmation),
  });
  errors.value = validationMessages(t, codes);
  if (Object.keys(codes).length > 0) return;

  loading.value = true;
  try {
    await iamStore.resetPassword(new ResetPasswordCommand({ token, newPassword: form.password }));
    await router.push({ name: 'login', query: { notice: 'password-updated' } });
  } catch (error) {
    const failure = AuthFailure.from(error);
    if (failure.reason === AuthFailureReason.LINK_EXPIRED) {
      linkProblem.value = 'expired';
    } else if (failure.reason === AuthFailureReason.LINK_INVALID) {
      linkProblem.value = 'invalid';
    } else {
      const fieldMessages = serverFieldMessages(
          t,
          failure,
          { newPassword: { code: AccountRuleError.PASSWORD_TOO_SHORT, params: { min: passwordRequirements.minLength } } },
          { newPassword: 'password' },
      );
      if (fieldMessages.password) {
        errors.value = fieldMessages;
      } else {
        errorMessage.value = authFailureMessage(t, locale.value, failure);
      }
    }
  } finally {
    loading.value = false;
  }
}
</script>
