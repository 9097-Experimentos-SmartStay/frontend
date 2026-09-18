<template>
  <AuthLayout
      :title="registeredEmail ? t('auth.register.successTitle') : t('auth.registerTitle')"
      :subtitle="registeredEmail ? '' : t('auth.requiredFieldsNote')"
      :headline="t('register.title')"
  >
    <template #actions>
      <router-link :to="{ name: 'login' }">
        <pv-button :label="t('nav.login')" class="p-button-secondary p-button-outlined" />
      </router-link>
    </template>

    <!-- US-01 scenario 1: account created, confirmation e-mail sent -->
    <div v-if="registeredEmail" class="auth-form">
      <div class="flex align-items-start gap-3 mb-3">
        <i class="pi pi-envelope text-primary text-4xl"></i>
        <p class="m-0 line-height-3">{{ t('auth.register.successMessage', { email: registeredEmail }) }}</p>
      </div>
      <p class="text-600 mt-0">{{ t('auth.register.successSignIn') }}</p>
      <pv-message v-if="resent" severity="success" class="mb-3">{{ t('auth.register.resent') }}</pv-message>
      <pv-message v-if="resendError" severity="error" class="mb-3">{{ resendError }}</pv-message>
      <pv-button
          :label="t('auth.register.resendButton')"
          icon="pi pi-refresh"
          class="p-button-outlined w-full mb-2"
          :loading="resending"
          @click="resend"
      />
      <pv-button :label="t('auth.goToLogin')" class="w-full" @click="router.push({ name: 'login' })" />
    </div>

    <form v-else class="auth-form" novalidate @submit.prevent="submit">
      <div class="grid">
        <div class="col-12 sm:col-6 field">
          <label for="firstName">{{ t('auth.firstNameLabel') }} *</label>
          <pv-input-text
              id="firstName"
              v-model="form.firstName"
              autocomplete="given-name"
              :placeholder="t('auth.firstNamePlaceholder')"
              :invalid="!!errors.firstName"
          />
          <small v-if="errors.firstName" class="field-error">{{ errors.firstName }}</small>
        </div>
        <div class="col-12 sm:col-6 field">
          <label for="lastName">{{ t('auth.lastNameLabel') }} *</label>
          <pv-input-text
              id="lastName"
              v-model="form.lastName"
              autocomplete="family-name"
              :placeholder="t('auth.lastNamePlaceholder')"
              :invalid="!!errors.lastName"
          />
          <small v-if="errors.lastName" class="field-error">{{ errors.lastName }}</small>
        </div>
      </div>

      <div class="field">
        <label for="email">{{ t('auth.emailLabel') }} *</label>
        <pv-input-text
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            :placeholder="t('auth.emailPlaceholder')"
            :invalid="!!errors.email"
        />
        <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
      </div>

      <PasswordField
          :email="form.email"
          v-model="form.password"
          v-model:confirmation="form.confirmation"
          :min-length="passwordRequirements.minLength"
          :max-length="passwordRequirements.maxLength"
          :error="errors.password"
          :confirmation-error="errors.confirmation"
          :label="t('auth.passwordLabel')"
      />

      <!-- US-01 scenario 2: e-mail already registered → suggest password recovery -->
      <pv-message v-if="failure" severity="error" class="mb-3">
        {{ failureText }}
        <router-link
            v-if="isEmailTaken"
            :to="{ name: 'forgot-password', query: { email: form.email } }"
            class="block mt-2 font-semibold"
        >{{ t('auth.recoverPasswordSuggestion') }}</router-link>
      </pv-message>

      <pv-button type="submit" :label="t('auth.registerButton')" class="w-full" :loading="loading" />
    </form>

    <div v-if="!registeredEmail" class="auth-links">
      <router-link :to="{ name: 'login' }">{{ t('auth.signInLink') }}</router-link>
    </div>
  </AuthLayout>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthLayout from '../components/auth-layout.vue';
import PasswordField from '@/shared/presentation/components/password-field.vue';
import useIamStore from '../../application/iam.store.js';
import { AuthFailure, AuthFailureReason } from '../../application/auth-failure.js';
import { SignUpCommand } from '../../domain/commands/sign-up.command.js';
import { UserRole } from '../../domain/user-role.js';
import { passwordRequirementsFor } from '../../domain/model/password-policy.js';
import {
  AccountRuleError,
  collectErrors,
  validateEmail,
  validateNewPassword,
  validatePasswordConfirmation,
  validatePersonName,
} from '../../domain/model/account-rules.js';
import { authFailureMessage, serverFieldMessages, validationMessages } from '../utils/auth-messages.js';

const { t, locale } = useI18n();
const router = useRouter();
const iamStore = useIamStore();

/** Self sign-up always creates a guest, so the guest password policy applies. */
const passwordRequirements = passwordRequirementsFor(UserRole.GUEST);

const form = reactive({ firstName: '', lastName: '', email: '', password: '', confirmation: '' });
const errors = ref({});
const failure = ref(null);
const loading = ref(false);
const registeredEmail = ref('');
const resending = ref(false);
const resent = ref(false);
const resendError = ref('');

const isEmailTaken = computed(() => failure.value?.reason === AuthFailureReason.EMAIL_ALREADY_REGISTERED);
const failureText = computed(() => (failure.value ? authFailureMessage(t, locale.value, failure.value) : ''));

/** US-01 scenarios 3 and 4: every missing or malformed field is highlighted at once. */
function validate() {
  const codes = collectErrors({
    firstName: () => validatePersonName(form.firstName),
    lastName: () => validatePersonName(form.lastName),
    email: () => validateEmail(form.email),
    password: () => validateNewPassword(form.password, passwordRequirements, form.email),
    confirmation: () => validatePasswordConfirmation(form.password, form.confirmation),
  });
  errors.value = validationMessages(t, codes);
  return Object.keys(codes).length === 0;
}

async function submit() {
  failure.value = null;
  if (!validate()) return;

  loading.value = true;
  try {
    const result = await iamStore.signUp(new SignUpCommand(form));
    registeredEmail.value = result.email;
  } catch (error) {
    const authFailure = AuthFailure.from(error);
    const fieldMessages = serverFieldMessages(t, authFailure, {
      firstName: { code: AccountRuleError.NAME_FORMAT },
      lastName: { code: AccountRuleError.NAME_FORMAT },
      email: { code: AccountRuleError.EMAIL_FORMAT },
      password: { code: AccountRuleError.PASSWORD_TOO_SHORT, params: { min: passwordRequirements.minLength } },
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

async function resend() {
  resending.value = true;
  resendError.value = '';
  try {
    await iamStore.resendVerification(registeredEmail.value);
    resent.value = true;
  } catch (error) {
    resendError.value = authFailureMessage(t, locale.value, error);
  } finally {
    resending.value = false;
  }
}
</script>
