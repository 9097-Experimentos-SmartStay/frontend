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
  Object.assign(primevue.config.locale, primeVueLocales[value] ?? primeVueLocales.es);
}, { immediate: true });
</script>

<style>
/* Reset y estilos base */
#app {
  font-family: 'Poppins', sans-serif;
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
