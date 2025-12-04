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
    <div v-else-if="profile || currentUser" class="profile-card">
      <!-- Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          {{ getInitials() }}
        </div>
        <div class="profile-header-info">
          <h1 class="profile-name">{{ getDisplayName() }}</h1>
          <p class="profile-email">{{ getEmail() }}</p>
          <span v-if="!profile" class="badge-incomplete">Perfil Incompleto</span>
        </div>
      </div>

      <!-- Profile Information -->
      <div class="profile-content">
        <!-- Account Information Section -->
        <div class="info-section">
          <h2 class="section-title">
            <span class="icon">👤</span>
            Información de Cuenta
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Usuario:</span>
              <span class="info-value">{{ currentUser?.username || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Correo Electrónico:</span>
              <span class="info-value">{{ getEmail() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ID de Usuario:</span>
              <span class="info-value">#{{ currentUser?.id || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Rol:</span>
              <span class="info-value">{{ currentUser?.role || 'GUEST' }}</span>
            </div>
          </div>
        </div>

        <!-- Personal Information Section (if profile exists) -->
        <div v-if="profile" class="info-section">
          <h2 class="section-title">
            <span class="icon">📋</span>
            Información Personal
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre:</span>
              <span class="info-value">{{ profile.firstName || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Apellido:</span>
              <span class="info-value">{{ profile.lastName || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono:</span>
              <span class="info-value">{{ profile.phone || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ID de Perfil:</span>
              <span class="info-value">#{{ profile.id }}</span>
            </div>
          </div>
        </div>

        <!-- Address Section (if profile exists) -->
        <div v-if="profile && (profile.street || profile.city || profile.country)" class="info-section">
          <h2 class="section-title">
            <span class="icon">📍</span>
            Dirección
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Calle:</span>
              <span class="info-value">{{ profile.street || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Número:</span>
              <span class="info-value">{{ profile.number || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ciudad:</span>
              <span class="info-value">{{ profile.city || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Código Postal:</span>
              <span class="info-value">{{ profile.postalCode || 'No especificado' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">País:</span>
              <span class="info-value">{{ profile.country || 'No especificado' }}</span>
            </div>
          </div>
        </div>

        <!-- No Profile Created Yet -->
        <div v-if="!profile" class="no-profile-section">
          <div class="no-profile-card">
            <span class="icon-large">📝</span>
            <h3>Completa tu Perfil</h3>
            <p>Aún no has completado tu información de perfil. Agrega más detalles para una mejor experiencia.</p>
            <button @click="handleCreateProfile" class="btn btn-primary">
              Completar Perfil
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="profile-actions">
        <button @click="handleBack" class="btn btn-secondary">
          Volver
        </button>
        <button v-if="profile" @click="handleEditProfile" class="btn btn-primary">
          Editar Perfil
        </button>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="not-found-container">
      <div class="not-found-card">
        <h2>Perfil no encontrado</h2>
        <p>No se pudo cargar la información del perfil.</p>
        <button @click="handleBack" class="btn btn-primary">
          Volver al Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProfileStore } from '../../application/profile.store.js';
import useIamStore from '@/iam/application/iam.store.js';

export default {
  name: 'ProfileDetail',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const profileStore = useProfileStore();
    const iamStore = useIamStore();

    const profile = computed(() => profileStore.getCurrentProfile);
    const loading = computed(() => profileStore.isLoading);
    const error = computed(() => profileStore.getError);
    const currentUser = ref(null);

    const loadProfile = async () => {
      try {
        // Get current user from IAM store
        let userId = iamStore.currentUserId;

        // Try to get from localStorage if not in store
        if (!userId) {
          const storedId = localStorage.getItem('user_id');
          if (storedId) {
            userId = Number(storedId);
            iamStore.currentUserId = userId;
          }
        }

        // Load users if not loaded
        if (iamStore.users.length === 0) {
          await iamStore.fetchUsers();
        }

        // Get current user data
        currentUser.value = iamStore.users.find(u => u.id === userId);

        // If user not found but we have username in store
        if (!currentUser.value && iamStore.currentUsername) {
          currentUser.value = {
            id: userId,
            username: iamStore.currentUsername,
            email: iamStore.currentUsername
          };
        }

        // Try to load profile by email or by ID from route params
        if (route.params.id) {
          // If we have an ID in the route, try to load by ID
          await profileStore.fetchProfileById(parseInt(route.params.id));
        } else if (currentUser.value?.email || currentUser.value?.username) {
          // Otherwise, try to load by email
          const email = currentUser.value.email || currentUser.value.username;
          await profileStore.fetchProfileByEmail(email);
        }

      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    const getInitials = () => {
      if (profile.value?.firstName && profile.value?.lastName) {
        return `${profile.value.firstName.charAt(0)}${profile.value.lastName.charAt(0)}`.toUpperCase();
      }

      const username = currentUser.value?.username || currentUser.value?.email || 'U';
      return username.substring(0, 2).toUpperCase();
    };

    const getDisplayName = () => {
      if (profile.value?.fullName) {
        return profile.value.fullName;
      }

      if (currentUser.value?.username) {
        return currentUser.value.username.split('@')[0];
      }

      return 'Usuario';
    };

    const getEmail = () => {
      return profile.value?.email || currentUser.value?.email || currentUser.value?.username || 'N/A';
    };

    const handleRetry = () => {
      loadProfile();
    };

    const handleBack = () => {
      router.push({ name: 'guest-dashboard' });
    };

    const handleCreateProfile = () => {
      router.push({ name: 'CreateProfile' });
    };

    const handleEditProfile = () => {
      // Navigate to edit profile (you can create this route later)
      console.log('Edit profile feature - coming soon');
      // router.push({ name: 'EditProfile', params: { id: profile.value.id } });
    };

    onMounted(() => {
      loadProfile();
    });

    return {
      profile,
      loading,
      error,
      currentUser,
      getInitials,
      getDisplayName,
      getEmail,
      handleRetry,
      handleBack,
      handleCreateProfile,
      handleEditProfile
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.badge-incomplete {
  display: inline-block;
  background: rgba(255, 193, 7, 0.9);
  color: #333;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.5rem;
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

.no-profile-section {
  padding: 2rem 0;
}

.no-profile-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.icon-large {
  font-size: 4rem;
}

.no-profile-card h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.no-profile-card p {
  margin: 0;
  color: #666;
  max-width: 500px;
}

.profile-actions {
  padding: 1.5rem 2rem;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
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
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #5568d3;
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

  .profile-actions {
    flex-direction: column;
  }
}
</style>