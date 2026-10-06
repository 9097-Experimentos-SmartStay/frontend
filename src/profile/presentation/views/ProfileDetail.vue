<template>
  <div class="p-4 md:p-6">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog />

    <!-- What will be uploaded: the centre square of the chosen picture -->
    <pv-dialog
        v-model:visible="preview.visible"
        modal
        :header="t('profileDetail.avatar.previewTitle')"
        :style="{ width: '24rem' }"
        :breakpoints="{ '480px': '92vw' }"
        @after-hide="discardPreview"
    >
      <div class="flex flex-column align-items-center gap-3">
        <img v-if="preview.url" :src="preview.url" :alt="t('profileDetail.avatar.previewAlt')" class="avatar-preview" />
        <p class="m-0 text-center text-color-secondary text-sm">{{ t('profileDetail.avatar.previewHint') }}</p>
      </div>
      <template #footer>
        <pv-button :label="t('common.cancel')" text severity="secondary" @click="preview.visible = false" />
        <pv-button :label="t('profileDetail.avatar.save')" icon="pi pi-check" :loading="avatarStore.saving" @click="saveAvatar" />
      </template>
    </pv-dialog>

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
            <div class="profile-avatar-block">
              <pv-avatar
                  :image="avatarStore.url || undefined"
                  :label="avatarStore.url ? undefined : user.initials"
                  class="profile-avatar"
                  size="xlarge"
                  shape="circle"
                  :aria-label="t('profileDetail.avatar.current')"
              />
              <div class="flex flex-column gap-1">
                <pv-button
                    :label="avatarStore.url ? t('profileDetail.avatar.change') : t('profileDetail.avatar.add')"
                    icon="pi pi-camera"
                    size="small"
                    :loading="preparing"
                    @click="fileInput.click()"
                />
                <pv-button
                    v-if="avatarStore.url"
                    :label="t('profileDetail.avatar.remove')"
                    icon="pi pi-trash"
                    size="small"
                    text
                    class="profile-avatar-remove"
                    :loading="avatarStore.saving && !preview.visible"
                    @click="confirmRemoveAvatar"
                />
              </div>
              <input
                  ref="fileInput"
                  type="file"
                  class="hidden"
                  :accept="AVATAR_SOURCE_TYPES.join(',')"
                  :aria-label="t('profileDetail.avatar.change')"
                  @change="onFileChosen"
              />
            </div>
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
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import useAvatarStore from '@/iam/application/avatar.store.js';
import { AVATAR_SOURCE_TYPES } from '@/iam/domain/model/avatar-image.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';
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
const avatarStore = useAvatarStore();
const toast = useToast();
const confirm = useConfirm();

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

// --- Profile picture ---
const fileInput = ref();
const preparing = ref(false);
/** The picture about to be uploaded: shown first so the user sees the crop before saving. */
const preview = reactive({ visible: false, url: null, image: null });

const AVATAR_ERROR_KEYS = Object.freeze({
  typeNotAllowed: 'profileDetail.avatar.typeNotAllowed',
  tooLarge: 'profileDetail.avatar.tooLarge',
  unreadable: 'profileDetail.avatar.unreadable',
});

function showAvatarError(failure) {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: t(failureMessageKey(failure, AVATAR_ERROR_KEYS), failure?.problem?.params ?? {}),
    life: 5000,
  });
}

async function onFileChosen(event) {
  const [file] = event.target.files ?? [];
  event.target.value = ''; // choosing the same file again must fire `change` again
  if (!file) return;
  preparing.value = true;
  try {
    const image = await avatarStore.prepare(file);
    Object.assign(preview, { visible: true, url: URL.createObjectURL(image), image });
  } catch (failure) {
    showAvatarError(failure);
  } finally {
    preparing.value = false;
  }
}

function discardPreview() {
  if (preview.url) URL.revokeObjectURL(preview.url);
  Object.assign(preview, { url: null, image: null });
}

async function saveAvatar() {
  try {
    await avatarStore.change(preview.image);
    preview.visible = false;
    toast.add({ severity: 'success', summary: t('profileDetail.avatar.saved'), life: 3000 });
  } catch (failure) {
    showAvatarError(failure);
  }
}

function confirmRemoveAvatar() {
  confirm.require({
    header: t('profileDetail.avatar.removeTitle'),
    message: t('profileDetail.avatar.removeMessage'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), text: true, severity: 'secondary' },
    acceptProps: { label: t('profileDetail.avatar.remove'), severity: 'danger' },
    accept: async () => {
      try {
        await avatarStore.remove();
        toast.add({ severity: 'success', summary: t('profileDetail.avatar.removed'), life: 3000 });
      } catch (failure) {
        showAvatarError(failure);
      }
    },
  });
}

onMounted(() => {
  loadProfile();
  avatarStore.load();
});
</script>

<style scoped>
.language-btn {
  min-width: 3rem;
}

.profile-header {
  background-color: var(--ss-navy);
  border-bottom: 4px solid var(--p-primary-color);
  flex-wrap: wrap;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
}

.profile-avatar-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  width: 6rem;
  height: 6rem;
  background: rgba(255, 255, 255, 0.15);
  border: 3px solid white;
  font-size: 2rem;
  font-weight: bold;
  overflow: hidden;
}

.profile-avatar :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* The text button sits on the navy header. */
.profile-avatar-remove.p-button {
  color: rgba(255, 255, 255, 0.85);
}

.profile-avatar-remove.p-button:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.avatar-preview {
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--p-primary-color);
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