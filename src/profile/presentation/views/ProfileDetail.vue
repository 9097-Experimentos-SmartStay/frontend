<template>
  <div class="p-4 md:p-6">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog />

    <div class="max-w-5xl mx-auto">
      <div class="flex justify-content-between align-items-center mb-3">
        <pv-button :label="t('common.back')" icon="pi pi-arrow-left" class="p-button-outlined p-button-secondary p-button-sm" @click="handleBack" />
      </div>

      <div v-if="profileStore.loading" class="flex flex-column align-items-center justify-content-center h-20rem">
        <pv-progress-spinner />
        <p class="text-color-secondary mt-3">{{ t('profileDetail.loading') }}</p>
      </div>

      <div v-else-if="profileStore.error" class="text-center p-8 surface-card border-round-xl shadow-1 border-1 border-red-100">
        <i class="pi pi-exclamation-triangle text-red-500 text-5xl mb-3"></i>
        <p class="text-red-600 mb-4">{{ t(apiErrorKey(profileStore.error)) }}</p>
        <pv-button :label="t('profileDetail.retry')" icon="pi pi-refresh" class="p-button-outlined p-button-danger" @click="loadProfile" />
      </div>

      <pv-card v-else-if="user" class="surface-card shadow-2 border-round-xl overflow-hidden">
        <template #header>
          <div class="profile-header">
            <pv-avatar :label="user.initials" class="profile-avatar" size="xlarge" shape="circle" />
            <div class="profile-header-info">
              <h1 class="profile-name">{{ guestProfile?.fullName || user.displayName }}</h1>
              <p class="profile-email">{{ user.email }}</p>
              <pv-tag v-if="isGuest && !guestProfile" :value="t('profileDetail.incompleteProfile')" severity="warn" rounded class="mt-2" />
            </div>
          </div>
        </template>

        <template #content>
          <EmailVerificationBanner />

          <section class="info-section">
            <h2 class="section-title"><i class="pi pi-user text-primary"></i>{{ t('profileDetail.accountInfo') }}</h2>
            <div class="grid">
              <div class="col-12 md:col-6 info-item">
                <span class="info-label">{{ t('profileDetail.email') }}</span>
                <span class="info-value">{{ user.email }}</span>
              </div>
              <div class="col-12 md:col-6 info-item">
                <span class="info-label">{{ t('profileDetail.role') }}</span>
                <pv-tag :value="t(`roles.${user.role}`)" severity="info" rounded class="w-max" />
              </div>
              <div v-if="user.firstName" class="col-12 md:col-6 info-item">
                <span class="info-label">{{ t('profileDetail.firstName') }}</span>
                <span class="info-value">{{ user.firstName }}</span>
              </div>
              <div v-if="user.lastName" class="col-12 md:col-6 info-item">
                <span class="info-label">{{ t('profileDetail.lastName') }}</span>
                <span class="info-value">{{ user.lastName }}</span>
              </div>
            </div>
          </section>

          <section v-if="guestProfile" class="info-section">
            <h2 class="section-title"><i class="pi pi-id-card text-primary"></i>{{ t('profileDetail.personalInfo') }}</h2>
            <div class="grid">
              <div class="col-12 md:col-6 info-item">
                <span class="info-label">{{ t('profileDetail.phone') }}</span>
                <span class="info-value">{{ guestProfile.phone || t('profileDetail.notSpecified') }}</span>
              </div>
              <div class="col-12 md:col-6 info-item">
                <span class="info-label">{{ t('profileDetail.document') }}</span>
                <span class="info-value">
                  {{ guestProfile.documentNumber ? `${t(`profileDetail.documentTypes.${guestProfile.documentType}`)} ${guestProfile.documentNumber}` : t('profileDetail.notSpecified') }}
                </span>
              </div>
              <div class="col-12 info-item">
                <span class="info-label">{{ t('profileDetail.address') }}</span>
                <span class="info-value">{{ guestProfile.fullAddress || t('profileDetail.notSpecified') }}</span>
              </div>
            </div>
          </section>

          <section v-if="staffProfile" class="info-section">
            <h2 class="section-title"><i class="pi pi-briefcase text-primary"></i>{{ t('profileDetail.jobInfo') }}</h2>
            <div class="grid">
              <div class="col-12 md:col-4 info-item">
                <span class="info-label">{{ t('profileDetail.employeeCode') }}</span>
                <span class="info-value">{{ staffProfile.code }}</span>
              </div>
              <div class="col-12 md:col-4 info-item">
                <span class="info-label">{{ t('profileDetail.position') }}</span>
                <span class="info-value">{{ staffProfile.position }}</span>
              </div>
              <div class="col-12 md:col-4 info-item">
                <span class="info-label">{{ t('profileDetail.shift') }}</span>
                <span class="info-value">{{ staffProfile.shift }}</span>
              </div>
            </div>
          </section>

          <pv-card v-if="isGuest && !guestProfile" class="no-profile-card bg-blue-50">
            <template #content>
              <div class="text-center">
                <i class="pi pi-file-edit text-6xl text-blue-500 mb-4"></i>
                <h3 class="text-color font-bold mb-2">{{ t('profileDetail.completeProfile') }}</h3>
                <p class="text-color-secondary mb-4">{{ t('profileDetail.completeProfileMessage') }}</p>
                <pv-button :label="t('profileDetail.completeProfileButton')" icon="pi pi-plus" @click="router.push({ name: 'create-profile' })" />
              </div>
            </template>
          </pv-card>
        </template>
      </pv-card>

      <AccountSecurityCard v-if="user && !profileStore.loading" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../../application/profile.store.js';
import useIamStore from '@/iam/application/iam.store.js';
import { UserRole } from '@/iam/domain/user-role.js';
import EmailVerificationBanner from '@/iam/presentation/components/email-verification-banner.vue';
import AccountSecurityCard from '@/iam/presentation/components/account-security-card.vue';
import { apiErrorKey } from '@/shared/presentation/utils/api-error.js';

/**
 * Own profile of the signed-in user: account data from the session, plus the guest profile
 * (GET /guests/user/{id}) for guests or the staff profile (GET /staff/user/{id}) for administrators.
 */
const router = useRouter();
const { t } = useI18n();
const profileStore = useProfileStore();
const iamStore = useIamStore();

const user = computed(() => iamStore.currentUser);
const isGuest = computed(() => user.value?.role === UserRole.GUEST);
const guestProfile = computed(() => profileStore.guestProfile);
const staffProfile = computed(() => profileStore.staffProfile);

function loadProfile() {
  if (!user.value) return;
  iamStore.refreshProfile();
  profileStore.fetchMyProfile(user.value);
}

const handleBack = () => router.push({ name: 'dashboard' });

onMounted(loadProfile);
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