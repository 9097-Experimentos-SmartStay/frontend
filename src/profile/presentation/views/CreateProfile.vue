<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="max-w-4xl mx-auto">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="handleCancel" />
          <h1 class="text-3xl font-bold text-color m-0">{{ t('createProfile.title') }}</h1>
        </div>
        <LanguageSwitcher />
      </div>

      <pv-card class="surface-card shadow-2 border-round-xl">
        <template #content>
          <form class="profile-form" novalidate @submit.prevent="handleSubmit">
            <div class="form-section">
              <h2 class="section-title">{{ t('createProfile.personalInfo') }}</h2>
              <div class="grid">
                <div class="col-12 md:col-6 field">
                  <label for="firstName" class="font-medium text-color">{{ t('createProfile.firstName') }} *</label>
                  <pv-input-text id="firstName" v-model="form.firstName" autocomplete="given-name" class="w-full" :invalid="!!errors.firstName" />
                  <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
                </div>
                <div class="col-12 md:col-6 field">
                  <label for="lastName" class="font-medium text-color">{{ t('createProfile.lastName') }} *</label>
                  <pv-input-text id="lastName" v-model="form.lastName" autocomplete="family-name" class="w-full" :invalid="!!errors.lastName" />
                  <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
                </div>
                <div class="col-12 md:col-6 field">
                  <label for="phone" class="font-medium text-color">{{ t('createProfile.phone') }} *</label>
                  <pv-input-text id="phone" v-model="form.phone" type="tel" autocomplete="tel" placeholder="+51987654321" class="w-full" :invalid="!!errors.phone" />
                  <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
                </div>
                <div class="col-12 md:col-6 field">
                  <label for="email" class="font-medium text-color">{{ t('createProfile.email') }}</label>
                  <pv-input-text id="email" v-model="form.email" type="email" class="w-full" disabled />
                  <small class="text-color-secondary">{{ t('createProfile.emailFromAccount') }}</small>
                </div>
                <div class="col-12 md:col-4 field">
                  <label for="documentType" class="font-medium text-color">{{ t('createProfile.documentType') }}</label>
                  <pv-select
                      v-model="form.documentType"
                      input-id="documentType"
                      :options="documentTypeOptions"
                      option-label="label"
                      option-value="value"
                      show-clear
                      :placeholder="t('createProfile.optional')"
                      class="w-full"
                      :invalid="!!errors.documentType"
                  />
                  <small v-if="errors.documentType" class="p-error">{{ errors.documentType }}</small>
                </div>
                <div class="col-12 md:col-8 field">
                  <label for="documentNumber" class="font-medium text-color">{{ t('createProfile.documentNumber') }}</label>
                  <pv-input-text id="documentNumber" v-model="form.documentNumber" class="w-full" :invalid="!!errors.documentNumber" />
                  <small v-if="errors.documentNumber" class="p-error">{{ errors.documentNumber }}</small>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h2 class="section-title">{{ t('createProfile.address') }}</h2>
              <p class="text-color-secondary mt-0">{{ t('createProfile.addressHint') }}</p>
              <div class="grid">
                <div v-for="field in addressFields" :key="field.name" :class="[field.col, 'field']">
                  <label :for="field.name" class="font-medium text-color">{{ t(`createProfile.${field.name}`) }}</label>
                  <pv-input-text :id="field.name" v-model="form[field.name]" :autocomplete="field.autocomplete" class="w-full" :invalid="!!errors[field.name]" />
                  <small v-if="errors[field.name]" class="p-error">{{ errors[field.name] }}</small>
                </div>
              </div>
            </div>

            <pv-message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</pv-message>

            <div class="flex justify-content-end gap-3 mt-5 pt-4 border-top-1 surface-border">
              <pv-button type="button" :label="t('common.cancel')" icon="pi pi-times" class="p-button-outlined p-button-secondary" :disabled="profileStore.loading" @click="handleCancel" />
              <pv-button type="submit" :label="t('createProfile.createButton')" icon="pi pi-check" :loading="profileStore.loading" />
            </div>
          </form>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../../application/profile.store.js';
import { CreateGuestProfileCommand } from '../../domain/commands/create-guest-profile.command.js';
import { DocumentType } from '../../domain/model/guest-profile.entity.js';
import useIamStore from '@/iam/application/iam.store.js';
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue';
import { apiErrorKey } from '@/shared/presentation/utils/api-error.js';

/**
 * The signed-in guest completes their guest profile (POST /guests; the owner comes from the token).
 */
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const profileStore = useProfileStore();
const iamStore = useIamStore();

const user = iamStore.currentUser;
const form = reactive({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  phone: '',
  email: user?.email ?? '',
  documentType: null,
  documentNumber: '',
  street: '',
  number: '',
  city: '',
  postalCode: '',
  country: '',
});
const errors = ref({});
const errorMessage = ref('');

const documentTypeOptions = Object.values(DocumentType).map((value) => ({ value, label: t(`profileDetail.documentTypes.${value}`) }));
const addressFields = [
  { name: 'street', col: 'col-12 md:col-9', autocomplete: 'address-line1' },
  { name: 'number', col: 'col-12 md:col-3', autocomplete: 'address-line2' },
  { name: 'city', col: 'col-12 md:col-6', autocomplete: 'address-level2' },
  { name: 'postalCode', col: 'col-12 md:col-6', autocomplete: 'postal-code' },
  { name: 'country', col: 'col-12', autocomplete: 'country-name' },
];

async function handleSubmit() {
  errorMessage.value = '';
  const command = new CreateGuestProfileCommand(form);
  const ruleErrors = command.validate();
  errors.value = Object.fromEntries(Object.entries(ruleErrors).map(([field, rule]) => [field, t(`createProfile.rules.${rule}`)]));
  if (Object.keys(ruleErrors).length > 0) return;

  try {
    await profileStore.createMyGuestProfile(command);
    toast.add({ severity: 'success', summary: t('createProfile.successTitle'), detail: t('createProfile.successMessage'), life: 3000 });
    router.push({ name: 'profile-detail' });
  } catch (err) {
    errorMessage.value = t(apiErrorKey(err, { 409: 'createProfile.conflict' }));
  }
}

const handleCancel = () => router.push({ name: 'profile-detail' });
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