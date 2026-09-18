<template>
  <div class="app-layout">
    <a class="app-layout__skip-link" href="#main-content">{{ t('nav.skipToContent') }}</a>
    <AppHeader />
    <main id="main-content" class="app-layout__main" tabindex="-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import AppHeader from '@/shared/presentation/components/app-header.vue';

/**
 * Shell of every signed-in page (guest and staff areas): the router nests all routes that need a session
 * under this layout, so no page can render without the header. Public account pages keep their own layout.
 */
const { t } = useI18n();
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-layout__main {
  flex: 1;
  min-width: 0;
}

.app-layout__main:focus { outline: none; }

.app-layout__skip-link {
  position: absolute;
  left: 1rem;
  top: -3rem;
  z-index: 200;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #0f172a;
  color: #ffffff;
  text-decoration: none;
}

.app-layout__skip-link:focus { top: 0.5rem; }
</style>
