<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="max-w-4xl mx-auto">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button
              icon="pi pi-arrow-left"
              :label="$t('common.back')"
              class="p-button-outlined p-button-sm"
              @click="handleCancel"
          />
          <h1 class="text-3xl font-bold text-color m-0">{{ $t('createProfile.title') }}</h1>
        </div>
        <pv-button
            :label="currentLocale.toUpperCase()"
            icon="pi pi-globe"
            class="p-button-text p-button-rounded language-btn"
            @click="toggleLanguage"
            v-tooltip.bottom="$t('common.changeLanguage')"
        />
      </div>

      <pv-card class="surface-card shadow-2 border-round-xl">
        <template #content>
          <form @submit.prevent="handleSubmit" class="profile-form">
            <!-- Personal Information Section -->
            <div class="form-section">
              <h2 class="section-title">{{ $t('createProfile.personalInfo') }}</h2>

              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label for="firstName" class="font-medium text-color">
                      {{ $t('createProfile.firstName') }} *
                    </label>
                    <pv-input-text
                        id="firstName"
                        v-model="formData.firstName"
                        type="text"
                        required
                        :placeholder="$t('createProfile.firstNamePlaceholder')"
                        class="w-full"
                    />
                  </div>
                </div>

                <div class="col-12 md:col-6">
                  <div class="field">
                    <label for="lastName" class="font-medium text-color">
                      {{ $t('createProfile.lastName') }} *
                    </label>
                    <pv-input-text
                        id="lastName"
                        v-model="formData.lastName"
                        type="text"
                        required
                        :placeholder="$t('createProfile.lastNamePlaceholder')"
                        class="w-full"
                    />
                  </div>
                </div>

                <div class="col-12">
                  <div class="field">
                    <label for="email" class="font-medium text-color">
                      {{ $t('createProfile.email') }} *
                    </label>
                    <pv-input-text
                        id="email"
                        v-model="formData.email"
                        type="email"
                        required
                        :placeholder="$t('createProfile.emailPlaceholder')"
                        class="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Address Section -->
            <div class="form-section">
              <h2 class="section-title">{{ $t('createProfile.address') }}</h2>

              <div class="grid">
                <div class="col-12 md:col-9">
                  <div class="field">
                    <label for="street" class="font-medium text-color">
                      {{ $t('createProfile.street') }} *
                    </label>
                    <pv-input-text
                        id="street"
                        v-model="formData.street"
                        type="text"
                        required
                        :placeholder="$t('createProfile.streetPlaceholder')"
                        class="w-full"
                    />
                  </div>
                </div>

                <div class="col-12 md:col-3">
                  <div class="field">
                    <label for="number" class="font-medium text-color">
                      {{ $t('createProfile.number') }} *
                    </label>
                    <pv-input-text
                        id="number"
                        v-model="formData.number"
                        type="text"
                        required
                        :placeholder="$t('createProfile.numberPlaceholder')"
                        class="w-full"
                    />
                  </div>
                </div>

                <div class="col-12 md:col-6">
                  <div class="field">
                    <label for="city" class="font-medium text-color">
                      {{ $t('createProfile.city') }} *
                    </label>
                    <pv-input-text
                        id="city"
                        v-model="formData.city"
                        type="text"
                        required
                        :placeholder="$t('createProfile.cityPlaceholder')"
                        class="w-full"
                    />
                  </div>
                </div>

                <div class="col-12 md:col-6">
                  <div class="field">
                    <label for="postalCode" class="font-medium text-color">
                      {{ $t('createProfile.postalCode') }} *
                    </label>
                    <pv-input-text
                        id="postalCode"
                        v-model="formData.postalCode"
                        type="text"
                        required
                        :placeholder="$t('createProfile.postalCodePlaceholder')"
                        class="w-full"
                    />
                  </div>
                </div>

                <div class="col-12">
                  <div class="field">
                    <label for="country" class="font-medium text-color">
                      {{ $t('createProfile.country') }} *
                    </label>
                    <pv-input-text
                        id="country"
                        v-model="formData.country"
                        type="text"
                        required
                        :placeholder="$t('createProfile.countryPlaceholder')"
                        class="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-content-end gap-3 mt-5 pt-4 border-top-1 surface-border">
              <pv-button
                  type="button"
                  :label="$t('common.cancel')"
                  icon="pi pi-times"
                  @click="handleCancel"
                  class="p-button-outlined p-button-secondary"
                  :disabled="loading"
              />
              <pv-button
                  type="submit"
                  :label="loading ? $t('createProfile.creating') : $t('createProfile.createButton')"
                  icon="pi pi-check"
                  class="p-button-primary"
                  :loading="loading"
              />
            </div>
          </form>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../../application/profile.store.js';

const router = useRouter();
const toast = useToast();
const profileStore = useProfileStore();
const { t, locale } = useI18n();

const currentLocale = computed(() => locale.value);

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  number: '',
  city: '',
  postalCode: '',
  country: ''
});

const loading = ref(false);

function toggleLanguage() {
  const newLocale = locale.value === 'en' ? 'es' : 'en';
  locale.value = newLocale;
  localStorage.setItem('language', newLocale);
}

const handleSubmit = async () => {
  loading.value = true;

  try {
    const profile = await profileStore.createProfile(formData.value);

    toast.add({
      severity: 'success',
      summary: t('createProfile.successTitle'),
      detail: t('createProfile.successMessage'),
      life: 3000
    });

    // Redirect to profile detail after a short delay
    setTimeout(() => {
      router.push(`/profiles/${profile.id}`);
    }, 1500);
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: err.message || t('createProfile.errorMessage'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/profiles');
};

onMounted(() => {
  // Load saved language
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }
});
</script>

<style scoped>
.language-btn {
  min-width: 3rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  border-bottom: 2px solid var(--surface-border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 500;
}
</style>