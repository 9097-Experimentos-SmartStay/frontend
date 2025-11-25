<template>
  <div class="smartstay-layout">
    <pv-toast position="top-right" />
    <pv-confirm-dialog />
    
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <router-link to="/dashboard" class="brand-link">
            <i class="pi pi-home text-2xl mr-2"></i>
            <span class="brand-text">Smart Stay</span>
          </router-link>
        </div>

        <div class="navbar-menu">
          <router-link to="/dashboard" class="nav-link">
            <i class="pi pi-th-large mr-1"></i>
            Dashboard
          </router-link>
          <router-link v-if="userRole === 'guest'" :to="{ name: 'guest-rooms' }" class="nav-link">
            <i class="pi pi-home mr-1"></i>
            Habitaciones
          </router-link>
          <router-link v-if="userRole === 'guest'" :to="{ name: 'guest-bookings' }" class="nav-link">
            <i class="pi pi-calendar mr-1"></i>
            Mis Reservas
          </router-link>
          <router-link v-if="userRole === 'staff'" to="/staff/dashboard" class="nav-link">
            <i class="pi pi-cog mr-1"></i>
            Panel Staff
          </router-link>
        </div>

        <div class="navbar-actions">
          <div v-if="currentUser" class="user-info">
            <i class="pi pi-user mr-2"></i>
            <span class="username">{{ currentUser.name || currentUser.email || 'Usuario' }}</span>
          </div>
          <pv-button
              icon="pi pi-sign-out"
              label="Cerrar Sesión"
              class="p-button-text p-button-sm logout-btn"
              @click="handleLogout"
          />
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useIamStore from '../../../iam/application/iam.store.js';

const router = useRouter();
const iamStore = useIamStore();

const userRole = ref(null);
const currentUser = ref(null);

function loadUserData() {
  userRole.value = localStorage.getItem('user_role');
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
}

function handleLogout() {
  iamStore.signOut(router);
}

onMounted(loadUserData);
</script>

<style scoped>
.smartstay-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  transition: opacity 0.2s;
}

.brand-link:hover {
  opacity: 0.9;
}

.brand-text {
  font-weight: 700;
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  color: white;
  font-weight: 500;
}

.username {
  font-size: 0.9rem;
}

.logout-btn {
  color: white !important;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 70px);
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .navbar-menu {
    flex-wrap: wrap;
    justify-content: center;
  }

  .navbar-actions {
    flex-direction: column;
    width: 100%;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>

