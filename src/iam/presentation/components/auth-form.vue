<template>
  <div class="auth-form-container">
    <pv-card class="auth-card">
      <template #content>
        <form @submit.prevent="handleSubmit" class="auth-form">
          <div v-if="!isLoginMode" class="form-group">
            <pv-float-label>
              <pv-input-text 
                id="name" 
                v-model="form.name" 
                :class="{'p-invalid': errors.name}"
                class="w-full"
              />
              <label for="name">{{ t('auth.nameLabel') }}</label>
            </pv-float-label>
            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
          </div>

          <div class="form-group">
            <pv-float-label>
              <pv-input-text 
                id="username" 
                v-model="form.username" 
                :class="{'p-invalid': errors.username}"
                class="w-full"
              />
              <label for="username">{{ t('auth.emailLabel') }}</label>
            </pv-float-label>
            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
          </div>

          <div class="form-group">
            <pv-float-label>
              <pv-password 
                id="password" 
                v-model="form.password" 
                :class="{'p-invalid': errors.password}"
                :feedback="!isLoginMode"
                toggleMask
                class="w-full"
              />
              <label for="password">{{ t('auth.passwordLabel') }}</label>
            </pv-float-label>
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <div class="form-group">
            <pv-select
              id="role"
              v-model="form.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('auth.rolePlaceholder')"
              :class="{'p-invalid': errors.role}"
              class="w-full"
            />
            <label for="role" class="select-label">{{ t('auth.roleLabel') }}</label>
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
            type="submit" 
            :label="isLoginMode ? t('auth.signInButton') : t('auth.registerButton')" 
            :icon="isLoginMode ? 'pi pi-sign-in' : 'pi pi-user-plus'"
            class="w-full auth-button"
            :loading="loading"
          />
        </form>
      </template>
    </pv-card>
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

  if (!form.role) {
    errors.role = t('auth.validationError');
    return false;
  }

  return true;
}

function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  if (isLoginMode.value) {
    const signInCommand = new SignInCommand({
      username: form.username,
      password: form.password
    });
    signIn(signInCommand, router);
    
    setTimeout(() => {
      loading.value = false;
      if (store.errors && store.errors.length > 0) {
        errorMessage.value = t('auth.authFailedGeneric');
      }
    }, 1000);
  } else {
    const signUpCommand = new SignUpCommand({
      username: form.username,
      password: form.password
    });
    signUp(signUpCommand, router);
    
    setTimeout(() => {
      loading.value = false;
      if (store.errors && store.errors.length > 0) {
        errorMessage.value = t('auth.authFailedGeneric');
      } else {
        successMessage.value = t('auth.registerSuccess');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    }, 1000);
  }
}
</script>

<style scoped>
.auth-form-container {
  width: 100%;
}

.auth-card {
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: 500;
  font-size: 0.875rem;
}

.w-full {
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
}

.auth-button {
  margin-top: 0.5rem;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.p-error {
  color: #c33;
  font-size: 0.875rem;
}
</style>

