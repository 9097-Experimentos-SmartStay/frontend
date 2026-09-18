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
/* Reset y estilos base. The font goes on body so PrimeVue overlays teleported to body (toasts, date pickers,
   select panels, menus) use it too. */
body {
  font-family: 'Poppins', sans-serif;
}

#app {
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
}

/* Centramos vistas como login/register */
.router-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
