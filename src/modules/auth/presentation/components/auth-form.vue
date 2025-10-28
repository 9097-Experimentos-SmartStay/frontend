<template>
  <div class="p-card p-4 max-w-md mx-auto">
    <h2 class="text-center mb-4">{{ isLogin ? 'Sign In' : 'Register' }}</h2>

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
import { ref, defineProps, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Import axios for profile operations

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

// --- Props ---
const props = defineProps({
  startInRegisterMode: {
    type: Boolean,
    default: false
  }
});

// --- Component State ---
const router = useRouter();
const isLogin = ref(true); // Initialize isLogin *once*
const loading = ref(false);
const form = ref({ email: '', name: '', password: '', role: '' });

// --- Define Roles ---
// Based on your domain classes and UML diagrams, including Visitor
const roles = ref([
  { label: 'Administrator', value: 'admin' }, // Corresponds to Host/Admin
  { label: 'Hotel Staff', value: 'staff' },   // Corresponds to HotelStaff/Staff
  { label: 'Guest', value: 'guest' },       // Corresponds to Guest
]);
// --- End Roles ---

// --- Lifecycle Hook ---
onMounted(() => {
  // Set initial mode based on prop *after* isLogin is defined
  if (props.startInRegisterMode) {
    isLogin.value = false;
  }
});


// --- Methods ---
function toggleMode() {
  isLogin.value = !isLogin.value;
  form.value = { email: '', name: '', password: '', role: '' };
}

async function submitForm() {
  if (!form.value.email || !form.value.password || !form.value.role || (!isLogin.value && !form.value.name)) {
    alert('Please fill in all required fields.');
    return;
  }

  loading.value = true;

  try {
    if (isLogin.value) {
      // --- Login Logic ---
      console.log(`Attempting login via Use Case for: ${form.value.email} as ${form.value.role}`);
      const user = await loginUseCase.execute(form.value.email, form.value.password, form.value.role);
      console.log('Login successful (Use Case):', user);

      // Fetch profile data to get the name (json-server needs query param)
      let userName = user.email; // Default to email
      try {
        // Fetch profile by user_id. json-server returns an array for queries.
        const profileResponse = await axios.get(`${import.meta.env.VITE_SMARTSTAY_API_URL}/profiles`, {
          params: { user_id: user.id }
        });
        if (profileResponse.data && profileResponse.data.length > 0) {
          userName = profileResponse.data[0].full_name || user.email;
        }
      } catch (profileError) {
        console.warn('Could not fetch profile for user:', user.id, profileError);
        // Proceed without profile name if fetching fails
      }


      localStorage.setItem('user_token', user.id); // Use ID as placeholder token
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: userName // Include name from profile or fallback
      }));

      console.log(`Redirecting user with role: ${user.role}`);
      await router.push({ name: 'dashboard' }); // Redirect to a single dashboard route

    } else {
      // --- Register Logic ---
      console.log(`Attempting registration via Use Case for: ${form.value.email}`);

      // Data for the /users endpoint
      const userData = {
        email: form.value.email,
        password: form.value.password, // Sending plain text password as in db.json
        role: form.value.role,
        // 'name' is NOT part of the users resource based on db.json and API call structure
      };

      const newUser = await registerUseCase.execute(userData);
      console.log('Registration successful (Use Case):', newUser);

      // --- Create profile after user creation ---
      if (newUser && newUser.id && form.value.name) {
        try {
          await axios.post(`${import.meta.env.VITE_SMARTSTAY_API_URL}/profiles`, {
            // id: `p${Date.now()}`, // Optional: json-server auto-generates id if omitted
            user_id: newUser.id, // Link profile to the newly created user
            full_name: form.value.name
            // Add other profile fields if needed
          });
          console.log('Profile created for new user:', newUser.id);
        } catch (profileError) {
          console.error('Failed to create profile after registration:', profileError);
          // Consider informing the user or logging this error more formally
          alert('User registered, but failed to create profile. Please update it later.');
        }
      }

      alert('User registered successfully. Please sign in.');
      isLogin.value = true; // Switch back to login view
      form.value = { email: '', name: '', password: '', role: '' }; // Clear form
    }
  } catch (error) {
    console.error('Auth Error (Use Case/API):', error.message || error);
    alert(`Authentication failed: ${error.message || 'Please check your details and try again.'}`);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.p-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
:deep(.p-inputtext),
:deep(.p-password),
:deep(.p-select), /* Ensure correct component name */
:deep(.p-button) {
  width: 100%;
}
</style>