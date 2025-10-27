<script setup>
import {useI18n} from "vue-i18n";

const { t } = useI18n();

</script>

<template>
  <div class="align-content-start justify-content-start m-4">
    <h1>{{ t('about.title')}}</h1>
    <img src="https://pm1.aminoapps.com/7584/3c39f0f35d1646413ae9b58561cd28f6c364f123r1-1400-1400v2_128.jpg" alt="ACME Logo" width="200" height="200"/>
    <p>{{ t('about.content')}}</p>
  </div>
</template>

<style scoped>

</style>