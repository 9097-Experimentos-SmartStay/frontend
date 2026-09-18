<script setup>
import { watch } from "vue";
import { useI18n } from "vue-i18n";

const { locale, availableLocales } = useI18n();

// Remember the choice (the same key i18n.js reads on start-up).
watch(locale, (value) => {
  try {
    localStorage.setItem('language', value);
  } catch {
    /* storage unavailable: the choice lasts until reload */
  }
});
</script>

<template>
  <pv-select-button v-model="locale" :options="availableLocales" :allow-empty="false"/>
</template>
