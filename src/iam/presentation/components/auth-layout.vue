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
  background-color: var(--ss-navy);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.top-right-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 3;
  display: flex;
  align-items: center;
}

/* Controls on the dark background: light outlines and a translucent language switch. */
.top-right-controls :deep(.p-button-outlined) {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.06);
}

.top-right-controls :deep(.p-button-outlined:not(:disabled):hover) {
  background: rgba(255, 255, 255, 0.16);
  border-color: #ffffff;
  color: #ffffff;
}

.top-right-controls :deep(.p-togglebutton) {
  background: rgba(255, 255, 255, 0.12);
  border-color: transparent;
  color: rgba(255, 255, 255, 0.85);
}

.top-right-controls :deep(.p-togglebutton-checked .p-togglebutton-content) {
  background: #ffffff;
  color: var(--ss-navy);
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
  font-family: var(--ss-font-display);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1.75rem;
  color: #ffffff;
}

/* Short orange rule under the headline. */
.headline::after {
  content: '';
  display: block;
  width: 3.5rem;
  height: 4px;
  margin-top: 1rem;
  background-color: var(--p-primary-color);
}

.auth-card {
  background: #ffffff;
  color: var(--p-surface-900);
  border-radius: var(--p-border-radius-xl);
  border-top: 4px solid var(--p-primary-color);
  padding: 2rem;
}

.card-title {
  margin: 0 0 0.5rem;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ss-navy);
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
  color: var(--p-primary-600);
  font-weight: 500;
}
</style>
