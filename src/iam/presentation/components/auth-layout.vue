<template>
  <div class="auth-page">
    <div class="top-right-controls">
      <LanguageSwitcher class="mr-2" />
      <slot name="actions" />
    </div>

    <div class="auth-content">
      <div class="form-section">
        <h1 v-if="headline" class="headline">{{ headline }}</h1>
        <div class="auth-card">
          <h2 class="card-title">{{ title }}</h2>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
          <slot />
        </div>
      </div>

      <div class="logo-section">
        <img :src="logoImage" :alt="t('login.logoAlt')" class="logo-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import logoImage from '@/assets/logo-modo-oscuro.png';
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue';

/**
 * Layout of the public account pages (login, register, e-mail verification, password recovery).
 */
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  headline: { type: String, default: '' },
});

const { t } = useI18n();
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  width: 100%;
  background-color: #0d2a4f;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.auth-page::before {
  content: '';
  position: absolute;
  top: -60%;
  left: -70%;
  width: 200%;
  height: 180%;
  background-color: #f5f0e1;
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

.auth-content {
  display: flex;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
  align-items: center;
  justify-content: space-around;
  padding: 5rem 3rem 3rem;
  box-sizing: border-box;
}

.form-section {
  flex: 1;
  min-width: 300px;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
}

.headline {
  color: #e67e22;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.auth-card {
  background: #ffffff;
  color: #1e293b;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 2rem;
}

.card-title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.card-subtitle {
  margin: 0 0 1.5rem;
  color: #475569;
  line-height: 1.5;
}

.logo-section {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 2rem;
  z-index: 2;
}

.logo-image {
  max-width: 80%;
  height: auto;
}

@media (max-width: 992px) {
  .auth-content {
    flex-direction: column;
    padding: 5rem 1rem 2rem;
  }
  .form-section {
    width: 100%;
  }
  .logo-section {
    padding-left: 0;
    max-width: 240px;
    margin-top: 2rem;
  }
  .auth-page::before {
    top: -40%;
    left: -80%;
    width: 220%;
    height: 120%;
  }
}
</style>

<style>
/* Shared form styles of the account pages (not scoped: used inside the slot). */
.auth-form .field {
  margin-bottom: 1rem;
}
.auth-form .field label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
}
.auth-form .p-inputtext,
.auth-form .p-password,
.auth-form .p-password-input,
.auth-form .p-button.w-full {
  width: 100%;
}
.auth-form .p-inputotp .p-inputtext {
  width: 2.75rem;
  text-align: center;
  font-size: 1.25rem;
}
.auth-form .field-error {
  color: #c62828;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.25rem;
}
.auth-form .field-hint {
  color: #64748b;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.25rem;
}
.auth-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  margin-top: 1.25rem;
}
.auth-links a {
  color: #2563eb;
}
</style>
