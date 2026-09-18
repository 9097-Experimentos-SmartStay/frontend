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
import useIamStore from '../../../iam/application/iam.store.js';

const router = useRouter();
const { t } = useI18n();
const iamStore = useIamStore();

// Signed in: /dashboard sends each role to its own dashboard. Otherwise: login.
const homeRouteName = computed(() => (iamStore.isSignedIn ? 'dashboard' : 'login'));

const buttonLabel = computed(() => {
  return iamStore.isSignedIn ? t('page-not-found.goHome') : t('nav.login');
});

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