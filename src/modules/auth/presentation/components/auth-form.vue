<template>
  <div class="p-card p-4 max-w-md mx-auto"> <h2 class="text-center mb-4">{{ isLogin ? 'Sign In' : 'Register' }}</h2>

    <div class="p-fluid">
      <div class="field">
        <label>Email</label>
        <pv-input-text v-model="form.email" />
      </div>

      <div class="field" v-if="!isLogin">
        <label>Name</label>
        <pv-input-text v-model="form.name" />
      </div>

      <div class="field">
        <label>Password</label>
        <pv-password v-model="form.password" toggleMask :feedback="false" />
      </div>

      <div class="field">
        <label>Role</label>
        <pv-select v-model="form.role" :options="roles" optionLabel="label" optionValue="value" placeholder="Select Role" class="w-full" />
      </div>

      <pv-button :label="isLogin ? 'Sign In' : 'Register'" class="mt-3 w-full" @click="submitForm" :loading="loading" />
    </div>

    <p class="text-center mt-3">
      <a href="#" @click.prevent="toggleMode">{{ isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In' }}</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// --- Import Use Cases, Service, Repository ---
import { LoginUseCase } from '../../application/login_use_case.js';
import { RegisterUseCase } from '../../application/register_use_case.js';
import { AuthService } from '../../domain/services/authservice.js';
import { UserAPIRepository } from '../../infrastructure/repositories/user_api_repository.js';

// --- Instantiate dependencies ---
const userApiRepository = new UserAPIRepository();
const authService = new AuthService(userApiRepository);
const loginUseCase = new LoginUseCase(authService);
const registerUseCase = new RegisterUseCase(authService);

// --- Component State ---
const router = useRouter();
const isLogin = ref(true);
const loading = ref(false);
const form = ref({ email: '', name: '', password: '', role: '' });

// --- *** CRITICAL: Roles MUST match db.json user.role strings *** ---
const roles = ref([
  // Label is for display, value is sent and compared
  { label: 'Administrator', value: 'Administrador' }, // Value matches db.json
  { label: 'Caregiver', value: 'Cuidador' },        // Value matches db.json
  { label: 'Family Member', value: 'Familiar' },      // Value matches db.json
]);
// --- *** END CRITICAL *** ---

// --- Methods ---
function toggleMode() {
  isLogin.value = !isLogin.value;
  // form.value = { email: '', name: '', password: '', role: '' }; // Optional reset
}

async function submitForm() {
  if (!form.value.email || !form.value.password || !form.value.role || (!isLogin.value && !form.value.name)) {
    alert('Please fill in all required fields.');
    return;
  }
  loading.value = true;
  try {
    if (isLogin.value) {
      // --- Login Call ---
      console.log(`Attempting login via Use Case for: ${form.value.email} as ${form.value.role}`); // Role sent is now 'Administrador', etc.
      const user = await loginUseCase.execute(form.value.email, form.value.password, form.value.role);
      console.log('Login successful (Use Case):', user);
      // Store auth info
      localStorage.setItem('user_token', user.id);
      localStorage.setItem('user_role', user.role); // Store actual role ('Administrador')
      localStorage.setItem('user', JSON.stringify({ id: user.id, email: user.email, role: user.role, name: user.name }));
      await router.push({ name: 'dashboard' });
    } else {
      // --- Register Call ---
      console.log(`Attempting registration via Use Case for: ${form.value.email}`);
      const userData = {
        email: form.value.email,
        name: form.value.name,
        password: form.value.password, // Pass plain text
        role: form.value.role, // Pass selected role ('Administrador', etc.)
      };
      const newUser = await registerUseCase.execute(userData);
      console.log('Registration successful (Use Case):', newUser);
      alert('User registered successfully. Please sign in.');
      isLogin.value = true;
    }
  } catch (error) {
    console.error('Auth Error (Use Case):', error.message);
    alert(`Authentication failed: ${error.message}`); // Show specific error from AuthService
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Scoped styles remain the same */
.p-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
:deep(.p-inputtext),
:deep(.p-password),
:deep(.p-select),
:deep(.p-button) {
  width: 100%;
}
</style>