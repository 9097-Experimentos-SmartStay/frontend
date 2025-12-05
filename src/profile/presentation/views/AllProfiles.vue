<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="max-w-7xl mx-auto">
      <div class="flex justify-content-between align-items-center mb-6">
        <h1 class="text-3xl font-bold text-color m-0">{{ $t('allProfiles.title') }}</h1>
        <pv-button
            :label="currentLocale.toUpperCase()"
            icon="pi pi-globe"
            class="p-button-text p-button-rounded language-btn"
            @click="toggleLanguage"
            v-tooltip.bottom="$t('common.changeLanguage')"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-column align-items-center justify-content-center h-20rem">
        <pv-progress-spinner />
        <p class="text-color-secondary mt-3">{{ $t('allProfiles.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center p-8 surface-card border-round-xl shadow-1 border-1 border-red-100">
        <div class="bg-red-50 border-circle w-6rem h-6rem flex align-items-center justify-content-center mx-auto mb-4">
          <i class="pi pi-exclamation-triangle text-red-500 text-5xl"></i>
        </div>
        <h3 class="text-color font-bold m-0 mb-2">{{ $t('common.error') }}</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <pv-button
            :label="$t('allProfiles.retry')"
            icon="pi pi-refresh"
            class="p-button-outlined p-button-danger"
            @click="loadProfiles"
        />
      </div>

      <!-- Profiles Content -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="profiles.length === 0" class="text-center p-8 surface-card border-round-xl shadow-1 border-1 surface-border">
          <div class="surface-ground border-circle w-6rem h-6rem flex align-items-center justify-content-center mx-auto mb-4">
            <i class="pi pi-user text-500 text-5xl"></i>
          </div>
          <h3 class="text-color font-bold m-0 mb-2">{{ $t('allProfiles.noProfiles') }}</h3>
          <p class="text-color-secondary mb-4">{{ $t('allProfiles.createFirst') }}</p>
          <pv-button
              :label="$t('allProfiles.createProfile')"
              icon="pi pi-plus"
              class="p-button-primary"
              @click="goToCreate"
          />
        </div>

        <!-- Profiles Grid -->
        <div v-else>
          <div class="grid">
            <div
                v-for="profile in profiles"
                :key="profile.id"
                class="col-12 md:col-6 lg:col-4"
            >
              <pv-card
                  class="surface-card shadow-2 border-round-xl h-full cursor-pointer hover:shadow-4 transition-duration-300"
                  @click="goToProfile(profile.id)"
              >
                <template #header>
                  <div class="flex align-items-center gap-3 p-4 pb-0">
                    <pv-avatar
                        :label="getInitials(profile.fullName)"
                        class="profile-avatar"
                        size="xlarge"
                        shape="circle"
                    />
                    <div>
                      <h3 class="text-xl font-bold text-color m-0 mb-1">{{ profile.fullName }}</h3>
                      <span class="text-color-secondary text-sm">ID: {{ profile.id }}</span>
                    </div>
                  </div>
                </template>

                <template #content>
                  <div class="flex flex-column gap-2">
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-envelope text-color-secondary"></i>
                      <span class="text-sm text-color-secondary">{{ $t('allProfiles.email') }}:</span>
                      <span class="text-sm text-color font-medium">{{ profile.email }}</span>
                    </div>
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-map-marker text-color-secondary"></i>
                      <span class="text-sm text-color-secondary">{{ $t('allProfiles.address') }}:</span>
                      <span class="text-sm text-color font-medium">{{ profile.streetAddress }}</span>
                    </div>
                  </div>
                </template>

                <template #footer>
                  <div class="flex justify-content-end">
                    <pv-button
                        :label="$t('allProfiles.viewDetails')"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        class="p-button-text p-button-sm"
                    />
                  </div>
                </template>
              </pv-card>
            </div>
          </div>

          <!-- Floating Action Button -->
          <pv-button
              icon="pi pi-plus"
              class="fab p-button-rounded p-button-primary shadow-4"
              @click="goToCreate"
              v-tooltip.left="$t('allProfiles.createProfile')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { profileStore } from '../../application/profile.store';

const router = useRouter();
const { t, locale } = useI18n();

const loading = ref(false);
const error = ref(null);

const currentLocale = computed(() => locale.value);
const profiles = computed(() => profileStore.state.profiles);

function toggleLanguage() {
  const newLocale = locale.value === 'en' ? 'es' : 'en';
  locale.value = newLocale;
  localStorage.setItem('language', newLocale);
}

async function loadProfiles() {
  loading.value = true;
  error.value = null;

  try {
    await profileStore.fetchAllProfiles();
  } catch (err) {
    error.value = err.message || t('allProfiles.errorMessage');
  } finally {
    loading.value = false;
  }
}

function goToProfile(profileId) {
  router.push(`/profiles/${profileId}`);
}

function goToCreate() {
  router.push('/profiles/create');
}

function getInitials(fullName) {
  return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
}

onMounted(() => {
  // Load saved language
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }

  loadProfiles();
});
</script>

<style scoped>
.language-btn {
  min-width: 3rem;
}

.profile-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  z-index: 999;
}

.transition-duration-300 {
  transition-duration: 300ms;
}

.hover\:shadow-4:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style