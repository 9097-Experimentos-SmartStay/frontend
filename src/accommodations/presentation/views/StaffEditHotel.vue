<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-5xl">
      <div class="flex align-items-center gap-3 mb-6">
        <pv-button icon="pi pi-arrow-left" :label="t('common.cancel')" class="p-button-outlined p-button-sm" @click="goBack" />
        <h1 class="text-3xl font-bold text-color m-0">{{ t('staffHotels.editTitle') }}</h1>
        <pv-button
            v-if="allowed"
            :label="t('hotelPaymentSettings.title')"
            icon="pi pi-wallet"
            class="p-button-outlined p-button-sm ml-auto"
            @click="router.push({ name: 'hotel-payment-settings', params: { hotelId } })"
        />
      </div>

      <div v-if="loadingData" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <pv-message v-else-if="!hotelStore.currentHotel" severity="error">{{ t('staffHotels.notFound') }}</pv-message>

      <!-- Admin scope (D2): an admin edits only the hotel in their hotelId -->
      <pv-message v-else-if="!allowed" severity="warn">{{ t('staffHotels.outOfScope') }}</pv-message>

      <pv-card v-else class="surface-card shadow-2 border-round-xl">
        <template #content>
          <HotelForm
              :form="form"
              :errors="errors"
              :categories="hotelStore.categories"
              :amenities="hotelStore.amenitiesList"
              :can-add-master-data="false"
              @upload="onUploadImage"
          />

          <pv-message v-if="errorMessage" severity="error" class="mt-3">{{ errorMessage }}</pv-message>

          <div class="mt-4 flex justify-content-end gap-2 pt-4 border-top-1 surface-border">
            <pv-button :label="t('staffHotels.discard')" icon="pi pi-times" class="p-button-text p-button-secondary" @click="goBack" />
            <pv-button :label="t('staffHotels.saveChanges')" icon="pi pi-check" :loading="isSaving" @click="submitForm" />
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { validateHotelForm, validateLocationParts } from '@/accommodations/domain/hotel-rules.js';
import useIamStore from '@/iam/application/iam.store.js';
import { canManageHotel } from '@/iam/domain/user-role.js';
import { failureMessageKey, violationMessages } from '@/shared/presentation/utils/failure-message.js';
import HotelForm from '../components/HotelForm.vue';
import { hotelImageUploadMessage } from '../utils/hotel-image-messages.js';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

const hotelId = Number(route.params.hotelId);
const loadingData = ref(true);
const isSaving = ref(false);
const errors = ref({});
const errorMessage = ref('');

const allowed = computed(() => canManageHotel(iamStore.currentUser, hotelId));
const form = reactive({ name: '', address: '', city: '', country: '', description: '', imageUrl: '', type: null, amenities: [] });

onMounted(async () => {
  await Promise.all([hotelStore.fetchOptions(), hotelStore.fetchHotelById(hotelId)]);
  const hotel = hotelStore.currentHotel;
  if (hotel) {
    // The API returns only `location`; the Hotel entity splits it into address, city and country.
    Object.assign(form, {
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      description: hotel.description ?? '',
      imageUrl: hotel.photoUrl ?? '',
      type: hotel.type,
      amenities: [...hotel.amenities],
    });
  }
  loadingData.value = false;
});

const goBack = () => router.push({ name: 'staff-hotels' });

async function onUploadImage(file) {
  try {
    form.imageUrl = await hotelStore.uploadHotelImage(file);
  } catch (failure) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: hotelImageUploadMessage(t, failure), life: 6000 });
  }
}

async function submitForm() {
  errorMessage.value = '';
  const invalid = { ...validateHotelForm(form), ...validateLocationParts(form) };
  errors.value = violationMessages(t, invalid, 'staffHotels.rules');
  if (Object.keys(invalid).length > 0) return;

  isSaving.value = true;
  try {
    await hotelStore.updateHotel(hotelId, form);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffHotels.updated'), life: 3000 });
    router.push({ name: 'staff-hotels' });
  } catch (err) {
    if (err.hasFieldViolations) errors.value = violationMessages(t, err.fieldViolations, 'staffHotels.rules');
    else errorMessage.value = t(failureMessageKey(err, { forbidden: 'staffHotels.outOfScope', notFound: 'staffHotels.notFound' }));
  } finally {
    isSaving.value = false;
  }
}
</script>
