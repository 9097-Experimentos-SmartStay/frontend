<template>
  <div class="p-4 admin-dashboard-container">
    <h1 class="text-2xl font-bold mb-4 text-center"> <i class="pi pi-user-shield mr-2"></i>{{ t('dashboard.adminTitle') }} </h1>
    <p class="text-lg mb-6 text-center">{{ t('dashboard.welcomeMessage', { name: userName }) }} 👋</p>

    <div class="flex flex-col items-center gap-4">
      <router-link :to="{ name: 'admin-manage-users' }" custom v-slot="{ navigate }">
        <pv-button
            :label="t('dashboard.manageStaffButton')"
            icon="pi pi-users"
            class="p-button-info w-full max-w-xs"
        @click="navigate"
        />
      </router-link>

      <router-link :to="{ name: 'admin-manage-rooms' }" custom v-slot="{ navigate }">
        <pv-button
            :label="t('dashboard.manageRoomsButton')"
            icon="pi pi-building"
            class="p-button-info w-full max-w-xs"
        @click="navigate"
        />
      </router-link>

      <pv-button
          :label="t('dashboard.logoutButton')"
          icon="pi pi-sign-out"
          class="p-button-danger w-full max-w-xs mt-4"
      @click="logout"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const userName = ref('');

onMounted(() => {
  const storedUser = localStorage.getItem('user');
  userName.value = storedUser ? JSON.parse(storedUser).name : t('dashboard.defaultUser');
  console.log('AdminDashboard mounted. User:', userName.value); // Debugging
});

// --- Función Logout ---
function logout() {
  console.log('Logging out...'); // Debugging
  localStorage.clear(); // Limpia TODO el localStorage (token, role, user)
  router.push({ name: 'login' }); // Redirige a la PÁGINA de login
}
</script>

<style scoped>
/* Añade estilos si es necesario */
.admin-dashboard-container {
  max-width: 600px; /* Limita el ancho para mejor apariencia */
  margin: 2rem auto; /* Centra el contenedor */
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.w-full {
  width: 100%;
}
.max-w-xs {
  max-width: 20rem; /* Ajusta según necesites */
}
.mt-4 {
  margin-top: 1rem;
}
.mb-6 {
  margin-bottom: 1.5rem;
}
.text-center {
  text-align: center;
}
.items-center {
  align-items: center;
}
.gap-4 {
  gap: 1rem;
}
.flex { display: flex;}
.flex-col { flex-direction: column;}
.mr-2 { margin-right: 0.5rem;}
/* Importa o define colores para p-button-info, p-button-danger */
.p-button-info {
  background-color: #3b82f6; /* Azul ejemplo */
  border-color: #3b82f6;
}
.p-button-danger {
  background-color: #ef4444; /* Rojo ejemplo */
  border-color: #ef4444;
}
</style>