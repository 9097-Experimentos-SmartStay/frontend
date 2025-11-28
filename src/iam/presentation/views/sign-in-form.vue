<template>
  <div class="login-page-container">
    <div class="top-right-controls">
      <LanguageSwitcher class="mr-2" />
      <router-link to="/register">
        <pv-button :label="t('nav.register')" class="p-button-secondary p-button-outlined" />
      </router-link>
    </div>

    <div class="login-content-wrapper">
      <div class="form-section">
        <h1 class="welcome-text">{{ t('login.title') }}</h1>
        <AuthForm :start-in-login-mode="true" />
      </div>

      <div class="logo-section">
        <img src="../../../assets/logo-modo-oscuro.png" :alt="t('login.logoAlt')" class="logo-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import PvButton from 'primevue/button';

// --- Import Shared Components ---
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue';
// --- Import the actual form component ---
import AuthForm from '../components/auth-form.vue';

// --- Initialize i18n ---
const { t } = useI18n();
</script>

<style scoped>
/* Styles remain unchanged */
.login-page-container {
  min-height: 100vh;
  width: 100%;
  background-color: #0d2a4f; /* Dark blue */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.login-page-container::before {
  content: '';
  position: absolute;
  top: -60%;
  left: -70%;
  width: 200%;
  height: 180%;
  background-color: #f5f0e1; /* Cream */
  border-radius: 50%;
  z-index: 1;
}

.top-right-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 3;
  display: flex;
  align-items: center;
}

.login-content-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
  align-items: center;
  justify-content: space-around;
  padding: 3rem;
  box-sizing: border-box;
}

.form-section {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-right: 2rem;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
}

.welcome-text {
  color: #e67e22; /* Orange */
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: left;
  width: 100%;
}

.logo-section {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 2rem;
  box-sizing: border-box;
  z-index: 2;
}

.logo-image {
  max-width: 80%;
  height: auto;
}

@media (max-width: 992px) {
  .login-content-wrapper {
    justify-content: center;
    flex-direction: column;
    padding: 2rem;
  }
  .form-section {
    padding-right: 0;
    align-items: center;
    margin-bottom: 3rem;
    max-width: 450px;
    order: 2;
  }
  .welcome-text {
    text-align: center;
    order: 1;
  }
  .logo-section {
    padding-left: 0;
    max-width: 300px;
    order: 3;
    margin-top: 2rem;
  }
  .login-page-container::before {
    top: -40%;
    left: -80%;
    width: 220%;
    height: 120%;
  }
}

@media (max-width: 576px) {
  .welcome-text {
    font-size: clamp(1.1rem, 5vw, 1.5rem);
  }
  .login-content-wrapper {
    padding: 1rem;
  }
}
</style>