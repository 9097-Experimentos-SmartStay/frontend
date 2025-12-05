<template>
  <div class="p-card p-4 max-w-md mx-auto">
    <h2 class="text-center mb-4">{{ isLoginMode ? t('auth.signInTitle') : t('auth.registerTitle') }}</h2>

    <div class="p-fluid">
      <div class="field">
        <label>{{ t('auth.emailLabel') }}</label>
        <pv-input-text
            v-model="form.username"
            :placeholder="t('auth.emailPlaceholder')"
            :class="{'p-invalid': errors.username}"
        />
        <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
      </div>

      <div class="field" v-if="!isLoginMode">
        <label>{{ t('auth.nameLabel') }}</label>
        <pv-input-text
            v-model="form.name"
            :placeholder="t('auth.namePlaceholder')"
            :class="{'p-invalid': errors.name}"
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>

      <div class="field">
        <label>{{ t('auth.passwordLabel') }}</label>
        <pv-password
            v-model="form.password"
            toggleMask
            :feedback="false"
            :placeholder="t('auth.passwordPlaceholder')"
            :class="{'p-invalid': errors.password}"
        />
        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
      </div>

      <div class="field" v-if="!isLoginMode">
        <label>{{ t('auth.roleLabel') }}</label>
        <pv-select
            v-model="form.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('auth.rolePlaceholder')"
            :class="{'p-invalid': errors.role}"
            class="w-full"
        />
        <small v-if="errors.role" class="p-error">{{ errors.role }}</small>
      </div>

      <div v-if="errorMessage" class="error-message">
        <i class="pi pi-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        <i class="pi pi-check-circle"></i>
        {{ successMessage }}
      </div>

      <pv-button
          :label="isLoginMode ? t('auth.signInButton') : t('auth.registerButton')"
          class="mt-3 w-full"
          @click="handleSubmit"
          :loading="loading"
      />
    </div>

    <p class="text-center mt-3">
      <router-link :to="isLoginMode ? '/register' : '/login'" class="text-blue-600 hover:text-blue-800">
        {{ isLoginMode ? t('auth.registerLink') : t('auth.signInLink') }}
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../application/iam.store.js';
import { SignInCommand } from '../../domain/sign-in.command.js';
import { SignUpCommand } from '../../domain/sign-up.command.js';

const props = defineProps({
  startInLoginMode: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const { t } = useI18n();
const store = useIamStore();
const { signIn, signUp } = store;

const isLoginMode = ref(props.startInLoginMode);

const form = reactive({
  name: '',
  username: '',
  password: '',
  role: ''
});

const errors = reactive({
  name: '',
  username: '',
  password: '',
  role: ''
});

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const roleOptions = [
  { label: t('auth.roleStaff'), value: 'staff' },
  { label: t('auth.roleGuest'), value: 'guest' }
];

watch(() => props.startInLoginMode, (newVal) => {
  isLoginMode.value = newVal;
  // Reset form when mode changes
  form.name = '';
  form.username = '';
  form.password = '';
  form.role = '';
  errors.name = '';
  errors.username = '';
  errors.password = '';
  errors.role = '';
  errorMessage.value = '';
  successMessage.value = '';
});

function validateForm() {
  errors.name = '';
  errors.username = '';
  errors.password = '';
  errors.role = '';

  // Conditional validation: Validate name only if not in Login mode
  if (!isLoginMode.value && !form.name) {
    errors.name = t('auth.validationError');
    return false;
  }

  if (!form.username) {
    errors.username = t('auth.validationError');
    return false;
  }

  if (!form.password) {
    errors.password = t('auth.validationError');
    return false;
  }

  // Critical change: Validate role only if NOT in Login mode
  if (!isLoginMode.value && !form.role) {
    errors.role = t('auth.validationError');
    return false;
  }

  return true;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    if (isLoginMode.value) {
      // Login: We only send username and password.
      // The backend (IAM Bounded Context) determines the role internally.
      const signInCommand = new SignInCommand({
        username: form.username,
        password: form.password
      });

      await signIn(signInCommand, router);
      // If we reach here, login was successful and router has redirected
      loading.value = false;
    } else {
      // Register: Here we send the selected role as part of the Command
      const signUpCommand = new SignUpCommand({
        username: form.username,
        password: form.password,
        role: form.role,
        name: form.name
      });

      await signUp(signUpCommand, router);
      loading.value = false;
      successMessage.value = t('auth.registerSuccess');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (error) {
    loading.value = false;
    errorMessage.value = t('auth.authFailedGeneric');
    console.error('Auth error:', error);
  }
}
</script>

<style scoped>
/* Styles remain unchanged */
.p-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background-color: transparent;
  border-radius: 8px;
}

.p-4 { padding: 24px; }
.max-w-md { width: 382.92px; max-width: 382.92px; }
.mx-auto { margin-left: 57.135px; margin-right: 57.135px; }
.text-center { text-align: center; }
.mb-4 { margin-bottom: 1rem; }
.mt-3 { margin-top: 0.75rem; }
.w-full { width: 100%; }
.text-blue-600 { color: #2563eb; }
.hover\:text-blue-800:hover { color: #1e40af; }
.p-fluid .field { margin-bottom: 1rem; }
.p-fluid .field label { display: block; margin-bottom: 0.5rem; font-weight: 500; }

:deep(.p-inputtext), :deep(.p-password), :deep(.p-select), :deep(.p-button) {
  width: 100%;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.success-message {
  background-color: #efe;
  color: #3c3;
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.p-error {
  color: #c33;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}
</style>