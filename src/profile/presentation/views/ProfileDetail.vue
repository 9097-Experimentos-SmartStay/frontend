<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="max-w-5xl mx-auto">
      <!-- Language Selector -->
      <div class="flex justify-content-end mb-3">
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
        <p class="text-color-secondary mt-3">{{ $t('profileDetail.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center p-8 surface-card border-round-xl shadow-1 border-1 border-red-100">
        <div class="bg-red-50 border-circle w-6rem h-6rem flex align-items-center justify-content-center mx-auto mb-4">
          <i class="pi pi-exclamation-triangle text-red-500 text-5xl"></i>
        </div>
        <h3 class="text-color font-bold m-0 mb-2">{{ $t('common.error') }}</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <pv-button
            :label="$t('profileDetail.retry')"
            icon="pi pi-refresh"
            class="p-button-outlined p-button-danger"
            @click="handleRetry"
        />
      </div>

      <!-- Profile Detail -->
      <div v-else-if="profile || currentUser">
        <pv-card class="surface-card shadow-2 border-round-xl overflow-hidden">
          <!-- Header -->
          <template #header>
            <div class="profile-header">
              <pv-avatar
                  :label="getInitials()"
                  class="profile-avatar"
                  size="xlarge"
                  shape="circle"
              />
              <div class="profile-header-info">
                <h1 class="profile-name">{{ getDisplayName() }}</h1>
                <p class="profile-email">{{ getEmail() }}</p>
                <pv-tag
                    v-if="!profile"
                    :value="$t('profileDetail.incompleteProfile')"
                    severity="warning"
                    rounded
                    class="mt-2"
                />
              </div>
            </div>
          </template>

          <template #content>
            <!-- Account Information Section -->
            <div class="info-section mb-4">
              <h2 class="section-title">
                <i class="pi pi-user text-primary"></i>
                {{ $t('profileDetail.accountInfo') }}
              </h2>
              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.username') }}:</span>
                    <span class="info-value">{{ currentUser?.username || 'N/A' }}</span>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.email') }}:</span>
                    <span class="info-value">{{ getEmail() }}</span>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.userId') }}:</span>
                    <span class="info-value">#{{ currentUser?.id || 'N/A' }}</span>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.role') }}:</span>
                    <pv-tag :value="currentUser?.role || 'GUEST'" severity="info" rounded />
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Information Section (if profile exists) -->
            <div v-if="profile" class="info-section mb-4">
              <h2 class="section-title">
                <i class="pi pi-id-card text-primary"></i>
                {{ $t('profileDetail.personalInfo') }}
              </h2>
              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.firstName') }}:</span>
                    <span class="info-value">{{ profile.firstName || $t('profileDetail.notSpecified') }}</span>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.lastName') }}:</span>
                    <span class="info-value">{{ profile.lastName || $t('profileDetail.notSpecified') }}</span>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.phone') }}:</span>
                    <span class="info-value">{{ profile.phone || $t('profileDetail.notSpecified') }}</span>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.profileId') }}:</span>
                    <span class="info-value">#{{ profile.id }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Address Section (if profile exists) -->
            <div v-if="profile && (profile.street || profile.city || profile.country)" class="info-section mb-4">
              <h2 class="section-title">
                <i class="pi pi-map-marker text-primary"></i>
                {{ $t('profileDetail.address') }}
              </h2>
              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.street') }}:</span>
                    <span class="info-value">{{ profile.street || $t('profileDetail.notSpecified') }}</span>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.number') }}:</span>
                    <span class="info-value">{{ profile.number || $t('profileDetail.notSpecified') }}</span>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.city') }}:</span>
                    <span class="info-value">{{ profile.city || $t('profileDetail.notSpecified') }}</span>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.postalCode') }}:</span>
                    <span class="info-value">{{ profile.postalCode || $t('profileDetail.notSpecified') }}</span>
                  </div>
                </div>
                <div class="col-12">
                  <div class="info-item">
                    <span class="info-label">{{ $t('profileDetail.country') }}:</span>
                    <span class="info-value">{{ profile.country || $t('profileDetail.notSpecified') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Profile Created Yet -->
            <div v-if="!profile" class="no-profile-section">
              <pv-card class="no-profile-card bg-blue-50">
                <template #content>
                  <div class="text-center">
                    <i class="pi pi-file-edit text-6xl text-blue-500 mb-4"></i>
                    <h3 class="text-color font-bold mb-2">{{ $t('profileDetail.completeProfile') }}</h3>
                    <p class="text-color-secondary mb-4">{{ $t('profileDetail.completeProfileMessage') }}</p>
                    <pv-button
                        :label="$t('profileDetail.completeProfileButton')"
                        icon="pi pi-plus"
                        class="p-button-primary"
                        @click="handleCreateProfile"
                    />
                  </div>
                </template>
              </pv-card>
            </div>
          </template>

          <template #footer>
            <div class="flex justify-content-between gap-3">
              <pv-button
                  :label="$t('common.back')"
                  icon="pi pi-arrow-left"
                  class="p-button-outlined p-button-secondary"
                  @click="handleBack"
              />
              <pv-button
                  v-if="profile"
                  :label="$t('profileDetail.editProfile')"
                  icon="pi pi-pencil"
                  class="p-button-primary"
                  @click="handleEditProfile"
              />
            </div>
          </template>
        </pv-card>
      </div>

      <!-- Not Found State -->
      <div v-else class="text-center p-8 surface-card border-round-xl shadow-1 border-1 surface-border">
        <i class="pi pi-search text-500 text-6xl mb-4"></i>
        <h3 class="text-color font-bold m-0 mb-2">{{ $t('profileDetail.notFound') }}</h3>
        <p class="text-color-secondary mb-4">{{ $t('profileDetail.notFoundMessage') }}</p>
        <pv-button
            :label="$t('profileDetail.backToDashboard')"
            icon="pi pi-home"
            class="p-button-primary"
            @click="handleBack"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../../application/profile.store.js';
import useIamStore from '@/iam/application/iam.store.js';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const profileStore = useProfileStore();
const iamStore = useIamStore();
const { t, locale } = useI18n();

const profile = computed(() => profileStore.getCurrentProfile);
const loading = computed(() => profileStore.isLoading);
const error = computed(() => profileStore.getError);
const currentUser = ref(null);
const currentLocale = computed(() => locale.value);

function toggleLanguage() {
  const newLocale = locale.value === 'en' ? 'es' : 'en';
  locale.value = newLocale;
  localStorage.setItem('language', newLocale);
}

const loadProfile = async () => {
  try {
    let userId = iamStore.currentUserId;

    if (!userId) {
      const storedId = localStorage.getItem('user_id');
      if (storedId) {
        userId = Number(storedId);
        iamStore.currentUserId = userId;
      }
    }

    if (iamStore.users.length === 0) {
      await iamStore.fetchUsers();
    }

    currentUser.value = iamStore.users.find(u => u.id === userId);

    if (!currentUser.value && iamStore.currentUsername) {
      currentUser.value = {
        id: userId,
        username: iamStore.currentUsername,
        email: iamStore.currentUsername
      };
    }

    if (route.params.id) {
      await profileStore.fetchProfileById(parseInt(route.params.id));
    } else if (currentUser.value?.email || currentUser.value?.username) {
      const email = currentUser.value.email || currentUser.value.username;
      await profileStore.fetchProfileByEmail(email);
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
};

const getInitials = () => {
  if (profile.value?.firstName && profile.value?.lastName) {
    return `${profile.value.firstName.charAt(0)}${profile.value.lastName.charAt(0)}`.toUpperCase();
  }

  const username = currentUser.value?.username || currentUser.value?.email || 'U';
  return username.substring(0, 2).toUpperCase();
};

const getDisplayName = () => {
  if (profile.value?.fullName) {
    return profile.value.fullName;
  }

  if (currentUser.value?.username) {
    return currentUser.value.username.split('@')[0];
  }

  return t('profileDetail.user');
};

const getEmail = () => {
  return profile.value?.email || currentUser.value?.email || currentUser.value?.username || 'N/A';
};

const handleRetry = () => {
  loadProfile();
};

const handleBack = () => {
  router.push({ name: 'guest-dashboard' });
};

const handleCreateProfile = () => {
  router.push({ name: 'CreateProfile' });
};

const handleEditProfile = () => {
  toast.add({
    severity: 'info',
    summary: t('profileDetail.comingSoon'),
    detail: t('profileDetail.editFeatureComingSoon'),
    life: 3000
  });
};

onMounted(() => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }

  loadProfile();
});
</script>

<style scoped>
.language-btn {
  min-width: 3rem;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
}

.profile-avatar {
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  font-size: 2rem;
  font-weight: bold;
}

.profile-header-info {
  flex: 1;
}

.profile-name {
  font-size: 2rem;
  margin: 0;
  font-weight: bold;
}

.profile-email {
  margin: 0.5rem 0 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.info-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid var(--surface-border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  text-transform: uppercase;
}

.info-value {
  font-size: 1rem;
  color: var(--text-color);
}

.no-profile-section {
  padding: 2rem 0;
}

.no-profile-card {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-name {
    font-size: 1.5rem;
  }
}
</style>