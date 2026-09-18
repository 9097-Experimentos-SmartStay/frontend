<template>
  <pv-card class="surface-card shadow-2 border-round-xl mt-4">
    <template #title>
      <span class="flex align-items-center gap-2"><i class="pi pi-lock"></i>{{ t('security.title') }}</span>
    </template>
    <template #content>
      <!-- Change password (§2.0 policy of the user's role) -->
      <section class="mb-4">
        <div class="flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 class="m-0 text-lg">{{ t('security.changePassword.title') }}</h3>
            <p class="m-0 text-color-secondary">{{ t('security.changePassword.subtitle') }}</p>
          </div>
          <pv-button
              v-if="!changing"
              :label="t('security.changePassword.open')"
              icon="pi pi-key"
              class="p-button-outlined"
              @click="changing = true"
          />
        </div>

        <form v-if="changing" class="mt-3 security-form" novalidate @submit.prevent="submitPasswordChange">
          <div class="field">
            <label for="current-password" class="block mb-2 font-medium">{{ t('security.changePassword.current') }} *</label>
            <pv-password
                v-model="form.currentPassword"
                input-id="current-password"
                toggle-mask
                :feedback="false"
                autocomplete="current-password"
                :invalid="!!errors.currentPassword"
            />
            <small v-if="errors.currentPassword" class="p-error block mt-1">{{ errors.currentPassword }}</small>
          </div>

          <PasswordField
              v-model="form.newPassword"
              v-model:confirmation="form.confirmation"
              input-id="security-new-password"
              :label="t('auth.newPasswordLabel')"
              :min-length="requirements.minLength"
              :max-length="requirements.maxLength"
              :email="user?.email ?? ''"
              :error="errors.newPassword"
              :confirmation-error="errors.confirmation"
          />

          <pv-message v-if="failureText" severity="error" class="mb-3">{{ failureText }}</pv-message>
          <div class="flex gap-2 justify-content-end">
            <pv-button :label="t('common.cancel')" class="p-button-text" @click="closePasswordChange" />
            <pv-button type="submit" :label="t('security.changePassword.submit')" icon="pi pi-check" :loading="saving" />
          </div>
        </form>
      </section>

      <!-- §2.5a: every session of the account, on every device -->
      <section class="flex flex-wrap justify-content-between align-items-center gap-2 border-top-1 surface-border pt-4">
        <div>
          <h3 class="m-0 text-lg">{{ t('security.signOutEverywhere.title') }}</h3>
          <p class="m-0 text-color-secondary">{{ t('security.signOutEverywhere.subtitle') }}</p>
        </div>
        <pv-button
            :label="t('security.signOutEverywhere.action')"
            icon="pi pi-sign-out"
            class="p-button-danger p-button-outlined"
            :loading="signingOut"
            @click="confirmSignOutEverywhere"
        />
      </section>
    </template>
  </pv-card>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import PasswordField from '@/shared/presentation/components/password-field.vue';
import useIamStore from '../../application/iam.store.js';
import { AuthFailure, AuthFailureReason } from '../../application/auth-failure.js';
import { ChangePasswordCommand } from '../../domain/commands/change-password.command.js';
import { AccountRuleError, collectErrors, validateNewPassword, validatePasswordConfirmation, validatePasswordPresent } from '../../domain/model/account-rules.js';
import { passwordRequirementsFor } from '../../domain/model/password-policy.js';
import { authFailureMessage, serverFieldMessages, validationMessages } from '../utils/auth-messages.js';

/**
 * Account security of the signed-in user (profile page): change the password with the policy of their role
 * (guest ≥ 15, staff ≥ 8, ≤ 128) and "Cerrar sesión en todos los dispositivos" (§2.5a).
 * Both end the session of this browser too, so the user goes back to the login.
 */
const { t, locale } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const iamStore = useIamStore();

const user = computed(() => iamStore.currentUser);
const requirements = computed(() => passwordRequirementsFor(user.value?.role ?? null));

const changing = ref(false);
const saving = ref(false);
const signingOut = ref(false);
const form = reactive({ currentPassword: '', newPassword: '', confirmation: '' });
const errors = ref({});
const failure = ref(null);
const failureText = computed(() => (failure.value ? authFailureMessage(t, locale.value, failure.value) : ''));

function closePasswordChange() {
  Object.assign(form, { currentPassword: '', newPassword: '', confirmation: '' });
  errors.value = {};
  failure.value = null;
  changing.value = false;
}

async function submitPasswordChange() {
  failure.value = null;
  const violations = collectErrors({
    currentPassword: () => validatePasswordPresent(form.currentPassword),
    newPassword: () => validateNewPassword(form.newPassword, requirements.value, user.value?.email ?? null),
    confirmation: () => validatePasswordConfirmation(form.newPassword, form.confirmation),
  });
  errors.value = validationMessages(t, violations);
  if (Object.keys(violations).length > 0) return;

  saving.value = true;
  try {
    await iamStore.changePassword(new ChangePasswordCommand(form));
    await router.push({ name: 'login', query: { notice: 'password-updated' } });
  } catch (error) {
    const authFailure = AuthFailure.from(error);
    if (authFailure.reason === AuthFailureReason.WRONG_CURRENT_PASSWORD) {
      errors.value = { currentPassword: t('security.changePassword.wrongCurrent') };
      return;
    }
    const fieldMessages = serverFieldMessages(t, authFailure, {
      newPassword: { code: AccountRuleError.PASSWORD_TOO_SHORT, params: { min: requirements.value.minLength } },
      currentPassword: { code: AccountRuleError.REQUIRED },
    });
    if (Object.keys(fieldMessages).length > 0) errors.value = fieldMessages;
    else failure.value = authFailure;
  } finally {
    saving.value = false;
  }
}

function confirmSignOutEverywhere() {
  confirm.require({
    header: t('security.signOutEverywhere.title'),
    message: t('security.signOutEverywhere.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('security.signOutEverywhere.action'), severity: 'danger' },
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    accept: async () => {
      signingOut.value = true;
      try {
        await iamStore.signOutEverywhere();
        await router.push({ name: 'login', query: { notice: 'signed-out-everywhere' } });
      } catch (error) {
        toast.add({ severity: 'error', summary: t('common.error'), detail: authFailureMessage(t, locale.value, AuthFailure.from(error)), life: 5000 });
      } finally {
        signingOut.value = false;
      }
    },
  });
}
</script>

<style scoped>
.security-form {
  max-width: 28rem;
}
.security-form :deep(.p-password),
.security-form :deep(.p-password-input) {
  width: 100%;
}
</style>
