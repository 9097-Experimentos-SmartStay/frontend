<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-5xl">
      <div class="flex align-items-center gap-3 mb-6">
        <pv-button icon="pi pi-arrow-left" :label="t('common.cancel')" class="p-button-outlined p-button-sm" @click="goBack" />
        <h1 class="text-3xl font-bold text-color m-0">{{ t('staffHotels.createTitle') }}</h1>
      </div>

      <!-- D2: an admin registers ONE hotel; after that the backend answers 409 -->
      <pv-message v-if="!allowed" severity="info" class="mb-4">
        {{ t('staffHotels.alreadyHasHotel') }}
        <pv-button :label="t('staffHotels.goToMyHotel')" class="p-button-sm mt-2 block" @click="goBack" />
      </pv-message>

      <pv-card v-else class="surface-card shadow-2 border-round-xl">
        <template #content>
          <pv-message v-if="isAdmin" severity="info" class="mb-4">{{ t('staffHotels.adminSingleHotelNote') }}</pv-message>

          <HotelForm
              :form="form"
              :errors="errors"
              :categories="hotelStore.categories"
              :amenities="hotelStore.amenitiesList"
              :can-add-master-data="canAddMasterData"
              @add-category="isCategoryDialogVisible = true"
              @add-amenity="isAmenityDialogVisible = true"
              @upload="onUploadImage"
          />

          <pv-message v-if="errorMessage" severity="error" class="mt-3">{{ errorMessage }}</pv-message>

          <div class="mt-4 flex justify-content-end gap-2 pt-4 border-top-1 surface-border">
            <pv-button :label="t('common.cancel')" icon="pi pi-times" class="p-button-text p-button-secondary" @click="goBack" />
            <pv-button :label="t('staffHotels.save')" icon="pi pi-check" :loading="isSaving" @click="submitForm" />
          </div>
        </template>
      </pv-card>
    </div>

    <AddCategoryDialog v-model="isCategoryDialogVisible" @category-added="(name) => form.type = name" />
    <AddAmenityDialog v-model="isAmenityDialogVisible" @amenity-added="(name) => form.amenities.push(name)" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { validateHotelForm, validateLocationParts } from '@/accommodations/domain/hotel-rules.js';
import useIamStore from '@/iam/application/iam.store.js';
import { AccommodationFailureReason } from '@/accommodations/application/accommodation-failure.js';
import { Capability, UserRole, canRegisterHotel } from '@/iam/domain/user-role.js';
import { failureMessageKey, violationMessages } from '@/shared/presentation/utils/failure-message.js';
import HotelForm from '../components/HotelForm.vue';
import AddCategoryDialog from '../components/AddCategoryDialog.vue';
import AddAmenityDialog from '../components/AddAmenityDialog.vue';

/**
 * Register a hotel. A chain_admin can register any number; an admin only their first one,
 * which becomes their hotel (D2).
 */
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

const isSaving = ref(false);
const isCategoryDialogVisible = ref(false);
const isAmenityDialogVisible = ref(false);
const errors = ref({});
const errorMessage = ref('');

const alreadyRegistered = ref(false);
const allowed = computed(() => canRegisterHotel(iamStore.currentUser) && !alreadyRegistered.value);
const isAdmin = computed(() => iamStore.role === UserRole.ADMIN);
const canAddMasterData = computed(() => iamStore.can(Capability.MANAGE_MASTER_DATA));

const form = reactive({ name: '', address: '', city: '', country: '', description: '', imageUrl: '', type: null, amenities: [] });

onMounted(() => hotelStore.fetchOptions());

const goBack = () => router.push({ name: 'staff-hotels' });

async function onUploadImage(file) {
  try {
    form.imageUrl = await hotelStore.uploadHotelImage(file);
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('staffHotels.uploadFailed'), life: 4000 });
  }
}

async function submitForm() {
  errorMessage.value = '';
  const invalid = { ...validateHotelForm(form), ...validateLocationParts(form) };
  errors.value = violationMessages(t, invalid, 'staffHotels.rules');
  if (Object.keys(invalid).length > 0) return;

  isSaving.value = true;
  try {
    // An admin's session is renewed by the store with a token that carries the new hotel: no new sign-in.
    const hotel = await hotelStore.createHotel(form);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffHotels.created', { name: hotel.name }), life: 3000 });
    router.push({ name: 'staff-hotels' });
  } catch (err) {
    if (err.reason === AccommodationFailureReason.HOTEL_ALREADY_REGISTERED) {
      // D2 / US-53 scenario 1: an admin manages a single hotel; the form is hidden.
      alreadyRegistered.value = true;
    } else if (err.hasFieldViolations) {
      errors.value = violationMessages(t, err.fieldViolations, 'staffHotels.rules');
    } else {
      errorMessage.value = t(failureMessageKey(err));
    }
  } finally {
    isSaving.value = false;
  }
}
</script>
