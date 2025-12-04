<template>
  <div class="create-profile-container">
    <div class="create-profile-card">
      <h1 class="title">Crear Perfil</h1>

      <form @submit.prevent="handleSubmit" class="profile-form">
        <!-- Personal Information Section -->
        <div class="form-section">
          <h2 class="section-title">Información Personal</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Nombre *</label>
              <input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  required
                  placeholder="Ingresa tu nombre"
                  class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="lastName">Apellido *</label>
              <input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  required
                  placeholder="Ingresa tu apellido"
                  class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico *</label>
            <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                placeholder="ejemplo@correo.com"
                class="form-input"
            />
          </div>
        </div>

        <!-- Address Section -->
        <div class="form-section">
          <h2 class="section-title">Dirección</h2>

          <div class="form-row">
            <div class="form-group" style="flex: 3">
              <label for="street">Calle *</label>
              <input
                  id="street"
                  v-model="formData.street"
                  type="text"
                  required
                  placeholder="Nombre de la calle"
                  class="form-input"
              />
            </div>

            <div class="form-group" style="flex: 1">
              <label for="number">Número *</label>
              <input
                  id="number"
                  v-model="formData.number"
                  type="text"
                  required
                  placeholder="123"
                  class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">Ciudad *</label>
              <input
                  id="city"
                  v-model="formData.city"
                  type="text"
                  required
                  placeholder="Ciudad"
                  class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="postalCode">Código Postal *</label>
              <input
                  id="postalCode"
                  v-model="formData.postalCode"
                  type="text"
                  required
                  placeholder="12345"
                  class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="country">País *</label>
            <input
                id="country"
                v-model="formData.country"
                type="text"
                required
                placeholder="País"
                class="form-input"
            />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button
              type="button"
              @click="handleCancel"
              class="btn btn-secondary"
              :disabled="loading"
          >
            Cancelar
          </button>
          <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading"
          >
            {{ loading ? 'Creando...' : 'Crear Perfil' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '../../application/profile.store.js';

export default {
  name: 'CreateProfile',

  setup() {
    const router = useRouter();
    const profileStore = useProfileStore();

    const formData = ref({
      firstName: '',
      lastName: '',
      email: '',
      street: '',
      number: '',
      city: '',
      postalCode: '',
      country: ''
    });

    const error = ref(null);
    const successMessage = ref(null);
    const loading = ref(false);

    const handleSubmit = async () => {
      error.value = null;
      successMessage.value = null;
      loading.value = true;

      try {
        const profile = await profileStore.createProfile(formData.value);
        successMessage.value = 'Perfil creado exitosamente';

        // Redirect to profile detail after 1.5 seconds
        setTimeout(() => {
          router.push(`/profiles/${profile.id}`);
        }, 1500);
      } catch (err) {
        error.value = err.message || 'Error al crear el perfil';
      } finally {
        loading.value = false;
      }
    };

    const handleCancel = () => {
      router.push('/profiles');
    };

    return {
      formData,
      error,
      successMessage,
      loading,
      handleSubmit,
      handleCancel
    };
  }
};
</script>

<style scoped>
.create-profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.create-profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #555;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.error-message {
  padding: 1rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  border-left: 4px solid #c62828;
}

.success-message {
  padding: 1rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  border-left: 4px solid #2e7d32;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
}
</style>