<template>
  <pv-dialog
      :visible="visible"
      modal
      :header="t('users.create.title')"
      :style="{ width: '34rem' }"
      :breakpoints="{ '640px': '95vw' }"
      @update:visible="emit('update:visible', $event)"
      @show="reset"
  >
    <form class="auth-form" novalidate @submit.prevent="submit">
      <div class="grid">
        <div class="col-12 sm:col-6 field">
          <label for="cu-firstName">{{ t('auth.firstNameLabel') }} *</label>
          <pv-input-text id="cu-firstName" v-model="form.firstName" :invalid="!!errors.firstName" />
          <small v-if="errors.firstName" class="field-error">{{ errors.firstName }}</small>
        </div>
        <div class="col-12 sm:col-6 field">
          <label for="cu-lastName">{{ t('auth.lastNameLabel') }} *</label>
          <pv-input-text id="cu-lastName" v-model="form.lastName" :invalid="!!errors.lastName" />
          <small v-if="errors.lastName" class="field-error">{{ errors.lastName }}</small>
        </div>
      </div>

      <div class="field">
        <label for="cu-email">{{ t('auth.emailLabel') }} *</label>
        <pv-input-text id="cu-email" v-model="form.email" type="email" :placeholder="t('auth.emailPlaceholder')" :invalid="!!errors.email" />
        <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
      </div>

      <div class="field">
        <label for="cu-role">{{ t('users.create.role') }} *</label>
        <pv-select
            v-model="form.role"
            input-id="cu-role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('users.create.rolePlaceholder')"
            :invalid="!!errors.role"
            class="w-full"
        />
        <small v-if="errors.role" class="field-error">{{ errors.role }}</small>
      </div>

      <PasswordField
          v-model="form.password"
          input-id="cu-password"
          :with-confirmation="false"
          :min-length="passwordRequirements.minLength"
          :max-length="passwordRequirements.maxLength"
          :error="errors.password"
          :label="t('users.create.initialPassword')"
      />
      <small class="field-hint mb-3">{{ t('users.create.initialPasswordHint') }}</small>

      <div v-if="showHotelChoice" class="field">
        <label for="cu-hotel">{{ t('users.create.hotel') }} *</label>
        <pv-select
            v-model="form.hotelId"
            input-id="cu-hotel"
            :options="hotels"
            option-label="name"
            option-value="id"
            filter
            :placeholder="t('users.create.hotelPlaceholder')"
            :invalid="!!errors.hotelId"
            class="w-full"
        />
        <small v-if="errors.hotelId" class="field-error">{{ errors.hotelId }}</small>
      </div>

      <pv-message v-if="failureText" severity="error" class="mb-2">{{ failureText }}</pv-message>
    </form>

    <template #footer>
      <pv-button :label="t('common.cancel')" class="p-button-text" @click="emit('update:visible', false)" />
      <pv-button :label="t('users.create.submit')" icon="pi pi-check" :loading="saving" @click="submit" />
    </template>
  </pv-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserManagementStore } from '../../application/user-management.store.js';
import { AuthFailure, AuthFailureReason } from '../../application/auth-failure.js';
import { CreateUserCommand } from '../../domain/commands/create-user.command.js';
import { isHotelBoundRole } from '../../domain/user-role.js';
import { passwordRequirementsFor } from '../../domain/model/password-policy.js';
import PasswordField from '@/shared/presentation/components/password-field.vue';
import {
  AccountRuleError,
  collectErrors,
  validateEmail,
  validateNewPassword,
  validatePersonName,
  validateRequired,
} from '../../domain/model/account-rules.js';
import { authFailureMessage, serverFieldMessages, validationMessages } from '../utils/auth-messages.js';

/**
 * US-03 scenario 1: create a staff user and assign reception, housekeeping or maintenance
 * (a chain_admin can also create admins and must pick the hotel of hotel-bound roles).
 */
const props = defineProps({
  visible: { type: Boolean, default: false },
  roles: { type: Array, required: true },
  hotels: { type: Array, default: () => [] },
  requiresHotelChoice: { type: Boolean, default: false },
});
const emit = defineEmits(['update:visible', 'created']);

const { t, locale } = useI18n();
const store = useUserManagementStore();

const emptyForm = () => ({ firstName: '', lastName: '', email: '', password: '', role: null, hotelId: null });
const form = reactive(emptyForm());
const errors = ref({});
const failureText = ref('');
const saving = ref(false);

const roleOptions = computed(() => props.roles.map((role) => ({ value: role, label: t(`roles.${role}`) })));
/** The initial password follows the policy of the role being assigned. */
const passwordRequirements = computed(() => passwordRequirementsFor(form.role));
const showHotelChoice = computed(() => props.requiresHotelChoice && !!form.role && isHotelBoundRole(form.role));

function reset() {
  Object.assign(form, emptyForm());
  errors.value = {};
  failureText.value = '';
}

function validate() {
  const codes = collectErrors({
    firstName: () => validatePersonName(form.firstName),
    lastName: () => validatePersonName(form.lastName),
    email: () => validateEmail(form.email),
    password: () => validateNewPassword(form.password, passwordRequirements.value),
    role: () => validateRequired(form.role),
    hotelId: () => (showHotelChoice.value ? validateRequired(form.hotelId) : null),
  });
  errors.value = validationMessages(t, codes);
  if (codes.hotelId) errors.value.hotelId = t('users.errors.hotelRequired');
  return Object.keys(codes).length === 0;
}

async function submit() {
  failureText.value = '';
  if (!validate()) return;

  saving.value = true;
  try {
    const created = await store.createUser(new CreateUserCommand({
      ...form,
      // An admin always creates users of their own hotel: the backend takes it from the token.
      hotelId: showHotelChoice.value ? form.hotelId : null,
    }));
    emit('created', created);
    emit('update:visible', false);
  } catch (error) {
    const failure = AuthFailure.from(error);
    const fieldMessages = serverFieldMessages(t, failure, {
      firstName: { code: AccountRuleError.NAME_FORMAT },
      lastName: { code: AccountRuleError.NAME_FORMAT },
      email: { code: AccountRuleError.EMAIL_FORMAT },
      password: { code: AccountRuleError.PASSWORD_TOO_SHORT, params: { min: passwordRequirements.value.minLength } },
    });
    if (Object.keys(fieldMessages).length > 0) {
      errors.value = fieldMessages;
    } else if (failure.reason === AuthFailureReason.EMAIL_ALREADY_REGISTERED) {
      errors.value = { email: t('auth.errors.emailAlreadyRegistered') };
    } else if (failure.reason === AuthFailureReason.CONFLICT) {
      failureText.value = t('users.errors.noHotel');
    } else if (failure.reason === AuthFailureReason.FORBIDDEN) {
      failureText.value = t('users.errors.forbiddenRole');
    } else {
      failureText.value = authFailureMessage(t, locale.value, failure);
    }
  } finally {
    saving.value = false;
  }
}
</script>
