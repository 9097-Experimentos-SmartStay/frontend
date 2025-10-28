<template>
  <div class="p-card p-4 max-w-md mx-auto">
    <h2 class="text-center mb-4">{{ isLogin ? t('auth.signInTitle') : t('auth.registerTitle') }}</h2>

    <div class="p-fluid">
      <div class="field">
        <label>{{ t('auth.emailLabel') }}</label>
        <pv-input-text v-model="form.email" :placeholder="t('auth.emailPlaceholder')" />
      </div>

      <div class="field" v-if="!isLogin">
        <label>{{ t('auth.nameLabel') }}</label>
        <pv-input-text v-model="form.name" :placeholder="t('auth.namePlaceholder')" />
      </div>

      <div class="field">
        <label>{{ t('auth.passwordLabel') }}</label>
        <pv-password v-model="form.password" toggleMask :feedback="false" :placeholder="t('auth.passwordPlaceholder')" />
      </div>

      <div class="field">
        <label>{{ t('auth.roleLabel') }}</label>
        <pv-select
            v-model="form.role"
            :options="translatedRoles"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('auth.rolePlaceholder')"
            class="w-full"
        />
      </div>

      <pv-button :label="isLogin ? t('auth.signInButton') : t('auth.registerButton')" class="mt-3 w-full" @click="submitForm" :loading="loading" />
    </div>

    <p class="text-center mt-3">
      <router-link :to="isLogin ? '/register' : '/login'" class="text-blue-600 hover:text-blue-800">
        {{ isLogin ? t('auth.registerLink') : t('auth.signInLink') }}
      </router-link>
    </p>
  </div>
</template>

<script setup>
// Import computed for dynamic role translation
import { ref, defineProps, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; // useRouter is still needed for programmatic navigation after login/register
import axios from 'axios';
import { useI18n } from 'vue-i18n';

// --- Import Use Cases, Service, Repository ---
import { LoginUseCase } from '../../application/login_use_case.js';
import { RegisterUseCase } from '../../application/register_use_case.js';
import { AuthService } from '../../domain/services/authservice.js';
import { UserAPIRepository } from '../../infrastructure/repositories/user_api_repository.js';

// --- Initialize i18n ---
const { t } = useI18n();

// --- Instantiate dependencies ---
const userApiRepository = new UserAPIRepository();
const authService = new AuthService(userApiRepository);
const loginUseCase = new LoginUseCase(authService);
const registerUseCase = new RegisterUseCase(authService);

// --- Props ---
const props = defineProps({
  // Renamed prop for clarity
  startInLoginMode: {
    type: Boolean,
    default: true // Default to showing Login form
  }
});

// --- Component State ---
const router = useRouter();
// Initialize based on the prop
const isLogin = ref(props.startInLoginMode);
const loading = ref(false);
const form = ref({ email: '', name: '', password: '', role: '' });

// --- Define Base Roles ---
const baseRoles = ref([
  { key: 'auth.roleAdmin', value: 'admin' },
  { key: 'auth.roleStaff', value: 'staff' },
  { key: 'auth.roleGuest', value: 'guest' }
]);

// --- Computed Property for Translated Roles ---
const translatedRoles = computed(() => {
  return baseRoles.value.map(role => ({
    label: t(role.key),
    value: role.value
  }));
});

// --- Lifecycle Hook ---
// No longer strictly needed if prop controls initial state, but can be kept for safety
onMounted(() => {
  // Optional: Force state based on prop again if needed, though ref initialization should handle it
  // isLogin.value = props.startInLoginMode;
});


// --- Methods ---
// toggleMode is NO LONGER NEEDED here, router-link handles navigation
// async function submitForm() remains the same as your previous correct version...
async function submitForm() {
  // Translate validation alert
  if (!form.value.email || !form.value.password || !form.value.role || (!isLogin.value && !form.value.name)) {
    alert(t('auth.validationError'));
    return;
  }

  loading.value = true;

  try {
    if (isLogin.value) {
      // --- Login Logic ---
      console.log(`Attempting login via Use Case for: ${form.value.email} as ${form.value.role}`);
      const user = await loginUseCase.execute(form.value.email, form.value.password, form.value.role);
      console.log('Login successful (Use Case):', user);

      let userName = user.email;
      try {
        const profileResponse = await axios.get(`${import.meta.env.VITE_SMARTSTAY_API_URL}/profiles`, {
          params: { user_id: user.id }
        });
        if (profileResponse.data && profileResponse.data.length > 0) {
          userName = profileResponse.data[0].full_name || user.email;
        }
      } catch (profileError) {
        console.warn('Could not fetch profile for user:', user.id, profileError);
      }

      localStorage.setItem('user_token', user.id);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: userName
      }));

      console.log(`Redirecting user with role: ${user.role}`);
      await router.push({ name: 'dashboard' }); // Redirect to a single dashboard route

    } else {
      // --- Register Logic ---
      console.log(`Attempting registration via Use Case for: ${form.value.email}`);
      const userData = {
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
      };

      const newUser = await registerUseCase.execute(userData);
      console.log('Registration successful (Use Case):', newUser);

      if (newUser && newUser.id && form.value.name) {
        try {
          await axios.post(`${import.meta.env.VITE_SMARTSTAY_API_URL}/profiles`, {
            user_id: newUser.id,
            full_name: form.value.name
          });
          console.log('Profile created for new user:', newUser.id);
        } catch (profileError) {
          console.error('Failed to create profile after registration:', profileError);
          // Translate profile error alert
          alert(t('auth.registerProfileError'));
        }
      }
      // Translate registration success alert
      alert(t('auth.registerSuccess'));

      // --- Navigate to Login after successful registration ---
      await router.push('/login'); // Redirect to login page

      // Clear form (might not be necessary due to navigation)
      // form.value = { email: '', name: '', password: '', role: '' };
    }
  } catch (error) {
    console.error('Auth Error (Use Case/API):', error.message || error);
    // Translate authentication failure alert
    alert(`${t('auth.authFailedPrefix')}: ${error.message || t('auth.authFailedGeneric')}`);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Styles remain unchanged */
.p-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
:deep(.p-inputtext),
:deep(.p-password),
:deep(.p-select),
:deep(.p-button) {
  width: 100%;
}
/* Optional: Style the router-link like the previous link if needed */
.text-blue-600 { color: #2563eb; }
.hover\:text-blue-800:hover { color: #1e40af; }
</style>