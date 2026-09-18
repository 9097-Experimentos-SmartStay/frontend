<template>
  <AuthLayout
      :title="sentTo ? t('auth.forgotPassword.sentTitle') : t('auth.forgotPassword.title')"
      :subtitle="sentTo ? '' : t('auth.forgotPassword.subtitle')"
  >
    <!-- US-04 scenarios 1 and 2: the same message whether the e-mail exists or not -->
    <div v-if="sentTo" class="auth-form">
      <div class="flex align-items-start gap-3 mb-4">
        <i class="pi pi-envelope text-primary text-4xl"></i>
        <p class="m-0 line-height-3">{{ t('auth.forgotPassword.sentMessage', { email: sentTo }) }}</p>
      </div>
      <pv-button :label="t('auth.backToLogin')" class="w-full mb-2" @click="router.push({ name: 'login' })" />
      <pv-button :label="t('auth.forgotPassword.sendAgain')" class="p-button-text w-full" @click="sentTo = ''" />
    </div>

    <form v-else class="auth-form" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="email">{{ t('auth.emailLabel') }}</label>
        <pv-input-text
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            :placeholder="t('auth.emailPlaceholder')"
            :invalid="!!emailError"
        />
        <small v-if="emailError" class="field-error">{{ emailError }}</small>
      </div>
      <pv-message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</pv-message>
      <pv-button type="submit" :label="t('auth.forgotPassword.submit')" class="w-full" :loading="loading" />

      <div class="auth-links">
        <router-link :to="{ name: 'login' }">{{ t('auth.backToLogin') }}</router-link>
      </div>
    </form>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthLayout from '../components/auth-layout.vue';
import useIamStore from '../../application/iam.store.js';
import { validateEmail } from '../../domain/model/account-rules.js';
import { authFailureMessage } from '../utils/auth-messages.js';

/**
 * /forgot-password (optionally ?email=): linked from the lock e-mail, the 409 of sign-up and the login.
 */
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const email = ref(typeof route.query.email === 'string' ? route.query.email : '');
const emailError = ref('');
const errorMessage = ref('');
const loading = ref(false);
const sentTo = ref('');

async function submit() {
  errorMessage.value = '';
  const violation = validateEmail(email.value);
  emailError.value = violation ? t(`validation.${violation.code}`) : '';
  if (violation) return;

  loading.value = true;
  try {
    await iamStore.requestPasswordRecovery(email.value.trim());
    sentTo.value = email.value.trim();
  } catch (error) {
    errorMessage.value = authFailureMessage(t, locale.value, error);
  } finally {
    loading.value = false;
  }
}
</script>
