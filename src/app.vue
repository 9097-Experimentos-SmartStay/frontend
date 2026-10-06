<template>
  <div id="app">
    <RouterView/>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePrimeVue } from 'primevue/config';
import { primeVueLocales } from './shared/presentation/primevue-locale.js';

// The router renders the views of each bounded context. Here only the PrimeVue texts follow the UI language.
const { locale } = useI18n();
const primevue = usePrimeVue();

watch(locale, (value) => {
  const { aria, ...texts } = primeVueLocales[value] ?? primeVueLocales.es;
  Object.assign(primevue.config.locale, texts);
  // Merge the accessible labels: PrimeVue has more of them than the ones translated here.
  primevue.config.locale.aria = { ...primevue.config.locale.aria, ...aria };
}, { immediate: true });
</script>

<style>
/* Single light theme: native controls, scrollbars and PrimeFlex's light-dark() colors always resolve to light. */
:root {
  color-scheme: light;
  /* Brand. The PrimeVue palette (orange primary, stone surfaces) is in shared/presentation/theme/smartstay-preset.js. */
  --ss-navy: #0d2a4f;
  --ss-navy-soft: #16365f;
  --ss-orange: #f97316;
  --ss-font-display: 'Bricolage Grotesque', 'DM Sans', system-ui, sans-serif;
}

/* Reset y estilos base. The font goes on body so PrimeVue overlays teleported to body (toasts, date pickers,
   select panels, menus) use it too. */
body {
  margin: 0;
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
  background-color: var(--p-surface-50);
  color: var(--p-surface-900);
}

h1, h2, h3 {
  font-family: var(--ss-font-display);
  letter-spacing: -0.02em;
}

::selection {
  background: var(--p-primary-200);
  color: var(--ss-navy);
}

.p-datatable .p-datatable-thead > tr > th {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: var(--p-surface-600);
}

/* Centramos vistas como login/register */
.router-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
