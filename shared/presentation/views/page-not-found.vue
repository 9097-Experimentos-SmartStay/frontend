<template>
  <div class="not-found-container">
    <div class="content-wrapper">
      <i class="pi pi-compass icon-primary" style="font-size: 5rem"></i>

      <h1 class="title">404</h1>
      <h2 class="subtitle">{{ t('page-not-found.title') }}</h2>

      <p class="message">
        {{ t('page-not-found.content', { 'unavailable-route': $route.path }) }}
      </p>

      <pv-button
          :label="buttonLabel"
          icon="pi pi-home"
          class="p-button-primary p-button-lg mt-6"
          @click="goHome"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import PvButton from 'primevue/button';

// --- Inicializa "Armas" ---
const router = useRouter();
const { t } = useI18n();

// --- "Táctica" de Redirección (¡LA "EVOLUCIÓN"!) ---

// 1. Lee el "uniforme" (rol) del jugador desde el localStorage
const userRole = localStorage.getItem('user_role');

// 2. Determina el "campo de juego" (la ruta del dashboard)
const homeRouteName = computed(() => {
  switch (userRole) {
    case 'admin':
      return 'admin-dashboard'; // Va al dashboard de admin
    case 'staff':
      return 'staff-dashboard'; // Va al dashboard de staff
    case 'guest':
      return 'guest-dashboard'; // Va al dashboard de guest
    default:
      return 'login'; // Si no hay rol (o es desconocido), va al login
  }
});

// 3. Define la "etiqueta" del botón basada en el rol
const buttonLabel = computed(() => {
  return userRole ? t('page-not-found.goHome') : t('nav.login');
});

// 4. La "jugada" de "disparo" (la acción de clic)
function goHome() {
  router.push({ name: homeRouteName.value });
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--surface-b);
  color: var(--text-color);
  text-align: center;
  padding: 2rem;
}

.content-wrapper {
  max-width: 500px;
  width: 100%;
  padding: 3rem;
  background-color: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.icon-primary {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

.title {
  font-size: 6rem;
  font-weight: 900;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
}

.subtitle {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color-secondary);
  margin: 0.5rem 0 1.5rem 0;
}

.message {
  font-size: 1.1rem;
  line-height: 1.6;
}

.p-button-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Animación de "flotación" para el ícono */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
</style>