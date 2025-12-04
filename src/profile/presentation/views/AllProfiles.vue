<template>
  <div class="profile-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando perfil...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <h2>Error</h2>
        <p>{{ error }}</p>
        <button @click="handleRetry" class="btn btn-primary">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Profile Detail -->
    <div v-else-if="profile" class="profile-card">
      <!-- Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          {{ profile.firstName.charAt(0) }}{{ profile.lastName.charAt(0) }}
        </div>
        <div class="profile-header-info">
          <h1 class="profile-name">{{ profile.fullName }}</h1>
          <p class="profile-email">{{ profile.email }}</p>
        </div>
      </div>

      <!-- Profile Information -->
      <div class="profile-content">
        <!-- Personal Information Section -->
        <div class="info-section">
          <h2 class="section-title">
            <span class="icon">👤</span>
            Información Personal
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre:</span>
              <span class="info-value">{{ profile.firstName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Apellido:</span>
              <span class="info-value">{{ profile.lastName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Correo Electrónico:</span>
              <span class="info-value">{{ profile.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ID:</span>
              <span class="info-value">#{{ profile.id }}</span>
            </div>
          </div>
        </div>

        <!-- Address Section -->
        <div class="info-section">
          <h2 class="section-title">
            <span class="icon">📍</span>
            Dirección
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Calle:</span>
              <span class="info-value">{{ profile.street }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Número:</span>
              <span class="info-value">{{ profile.number }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ciudad:</span>
              <span class="info-value">{{ profile.city }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Código Postal:</span>
              <span class="info-value">{{ profile.postalCode }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">País:</span>
              <span class="info-value">{{ profile.country }}</span>
            </div>
            <div class="info-item full-width address-full">
              <span class="info-label">Dirección Completa:</span>
              <span class="info-value">{{ profile.fullAddress }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="profile-actions">
        <button @click="handleBack" class="btn btn-secondary">
          Volver
        </button>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="not-found-container">
      <div class="not-found-card">
        <h2>Perfil no encontrado</h2>
        <p>El perfil que buscas no existe.</p>
        <button @click="handleBack" class="btn btn-primary">
          Volver a la lista
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProfileStore } from '../../application/profile.store.js';

export default {
  name: 'ProfileDetail',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const profileStore = useProfileStore();

    const profileId = ref(parseInt(route.params.id));

    const profile = computed(() => profileStore.getCurrentProfile);
    const loading = computed(() => profileStore.isLoading);
    const error = computed(() => profileStore.getError);

    const loadProfile = async () => {
      try {
        await profileStore.fetchProfileById(profileId.value);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    const handleRetry = () => {
      loadProfile();
    };

    const handleBack = () => {
      router.push('/profiles');
    };

    onMounted(() => {
      loadProfile();
    });

    return {
      profile,
      loading,
      error,
      handleRetry,
      handleBack
    };
  }
};
</script>

<style scoped>
.profile-detail-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #666;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container,
.not-found-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.error-card,
.not-found-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  max-width: 500px;
}

.error-card h2,
.not-found-card h2 {
  color: #c62828;
  margin-bottom: 1rem;
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  border: 3px solid white;
}

.profile-header-info {
  flex: 1;
}

.profile-name {
  font-size: 2rem;
  margin: 0;
  font-weight: bold;
}

.profile-email {
  margin: 0.5rem 0 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.profile-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.icon {
  font-size: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item.address-full {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.info-value {
  font-size: 1rem;
  color: #333;
}

.profile-actions {
  padding: 1.5rem 2rem;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-start;
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

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>