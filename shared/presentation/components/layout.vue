<script setup>
import {useI18n} from "vue-i18n";
import {ref} from "vue";
import {Button as PvButton} from "primevue";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";

const { t } = useI18n();
const drawer = ref(false);
const toggleDrawer = () => { drawer.value = !drawer.value;};

// Navigation items
const items = [
  { label: 'option.home',       to: '/home'},
  //{ label: 'option.about',      to: '/about'},
  { label: 'option.dashboard', to: '/dashboard' },
  { label: 'option.playerCheckIn', to: '/player-management' }
];

// Environment variable for logo base URL
const logoBaseUrl = import.meta.env.VITE_LOGO_API_BASE_URL;
const bluelockLogoUrl = `${logoBaseUrl}bluelock-pr.com`;

</script>

<template>
  <pv-toast/>
  <pv-confirm-dialog/>
  <div class="header">
    <pv-toolbar class="bg-primary">

      <template #start>
        <pv-button class="p-button-text text-white" icon="pi pi-bars" @click="toggleDrawer"/>
        <div class="flex align-items-center gap-2">
          <img :src="bluelockLogoUrl" alt="BBVA Peru Logo" style="height: 35px;" />
          <span class="text-white font-semibold">Blue Lock Project - Data Hub</span>
        </div>
      </template>

      <template #center>
        <div class="flex align-items-center gap-3">
          <pv-button v-for="item in items" :key="item.label" as-child v-slot ="slotProps">
            <router-link :to="item.to" :class="[slotProps.class, 'text-white']">{{ t(item.label)}}</router-link>
          </pv-button>
        </div>
      </template>

      <template #end>
        <language-switcher/>
      </template>

    </pv-toolbar>
    <pv-drawer v-model:visible="drawer"/>
  </div>
  <div class="main-content">
    <router-view/>
  </div>
  <div class="footer">
    <footer-content/>
  </div>
</template>

<style scoped>
.header {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.main-content {
  margin-top: 70px;
  padding-bottom: 60px;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
}
</style>