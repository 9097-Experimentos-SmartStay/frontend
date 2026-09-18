<template>
  <div class="p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-4xl">
      <div class="flex flex-wrap align-items-center gap-3 mb-4">
        <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="goBack" />
        <div>
          <h1 class="text-3xl font-bold text-color m-0">{{ t('hotelPaymentSettings.title') }}</h1>
          <p v-if="hotelName" class="text-color-secondary m-0 mt-1">{{ hotelName }}</p>
        </div>
      </div>

      <div v-if="loadingData" class="flex justify-content-center p-8"><pv-progress-spinner /></div>

      <pv-message v-else-if="loadError" severity="error">{{ loadError }}</pv-message>

      <template v-else>
        <pv-message v-if="justRegistered" severity="success" class="mb-3">{{ t('hotelPaymentSettings.afterRegistration') }}</pv-message>

        <pv-message :severity="accepts ? 'success' : 'warn'" class="mb-4">
          {{ accepts ? t('hotelPaymentSettings.ready') : t('hotelPaymentSettings.notReady') }}
        </pv-message>

        <pv-card class="surface-card shadow-2 border-round-xl">
          <template #content>
            <p class="text-color-secondary mt-0 mb-4 line-height-3">{{ canEdit ? t('hotelPaymentSettings.intro') : t('hotelPaymentSettings.readOnly') }}</p>

            <form class="grid p-fluid formgrid" novalidate @submit.prevent="submit">
              <div class="col-12 field">
                <label for="ps-holder" class="font-bold text-color">{{ t('hotelPaymentSettings.accountHolder') }} *</label>
                <pv-input-text id="ps-holder" v-model="form.accountHolder" :disabled="!canEdit" :placeholder="t('hotelPaymentSettings.accountHolderPlaceholder')" :invalid="!!errors.accountHolder" />
                <small v-if="errors.accountHolder" class="p-error">{{ errors.accountHolder }}</small>
                <small v-else class="text-color-secondary">{{ t('hotelPaymentSettings.accountHolderHint') }}</small>
              </div>

              <div class="col-12"><h2 class="text-lg font-semibold mt-2 mb-2">{{ t('hotelPaymentSettings.wallets') }}</h2></div>
              <div class="col-12 md:col-6 field">
                <label for="ps-yape" class="font-bold text-color">Yape</label>
                <pv-input-text id="ps-yape" v-model="form.yapeNumber" inputmode="numeric" :disabled="!canEdit" placeholder="987 654 321" :invalid="!!errors.yapeNumber" />
                <small v-if="errors.yapeNumber" class="p-error">{{ errors.yapeNumber }}</small>
              </div>
              <div class="col-12 md:col-6 field">
                <label for="ps-plin" class="font-bold text-color">Plin</label>
                <pv-input-text id="ps-plin" v-model="form.plinNumber" inputmode="numeric" :disabled="!canEdit" placeholder="987 654 321" :invalid="!!errors.plinNumber" />
                <small v-if="errors.plinNumber" class="p-error">{{ errors.plinNumber }}</small>
              </div>

              <div class="col-12"><h2 class="text-lg font-semibold mt-2 mb-2">{{ t('hotelPaymentSettings.bankTransfer') }}</h2></div>
              <div class="col-12 md:col-4 field">
                <label for="ps-bank" class="font-bold text-color">{{ t('hotelPaymentSettings.bankName') }}</label>
                <pv-input-text id="ps-bank" v-model="form.bankName" :disabled="!canEdit" :placeholder="t('hotelPaymentSettings.bankNamePlaceholder')" :invalid="!!errors.bankName" />
                <small v-if="errors.bankName" class="p-error">{{ errors.bankName }}</small>
              </div>
              <div class="col-12 md:col-4 field">
                <label for="ps-account" class="font-bold text-color">{{ t('hotelPaymentSettings.bankAccountNumber') }}</label>
                <pv-input-text id="ps-account" v-model="form.bankAccountNumber" inputmode="numeric" :disabled="!canEdit" placeholder="191-12345678-0-12" :invalid="!!errors.bankAccountNumber" />
                <small v-if="errors.bankAccountNumber" class="p-error">{{ errors.bankAccountNumber }}</small>
              </div>
              <div class="col-12 md:col-4 field">
                <label for="ps-cci" class="font-bold text-color">{{ t('hotelPaymentSettings.bankAccountCci') }}</label>
                <pv-input-text id="ps-cci" v-model="form.bankAccountCci" inputmode="numeric" :disabled="!canEdit" placeholder="00219100123456780123" :invalid="!!errors.bankAccountCci" />
                <small v-if="errors.bankAccountCci" class="p-error">{{ errors.bankAccountCci }}</small>
                <small v-else class="text-color-secondary">{{ t('hotelPaymentSettings.cciHint') }}</small>
              </div>

              <div class="col-12">
                <pv-message v-if="errors.methods" severity="error" class="mt-2">{{ errors.methods }}</pv-message>
                <pv-message v-if="errorMessage" severity="error" class="mt-2">{{ errorMessage }}</pv-message>
                <small class="block text-color-secondary mt-2">{{ t('hotelPaymentSettings.frontDeskNote') }}</small>
              </div>

              <div v-if="canEdit" class="col-12 flex justify-content-end gap-2 pt-3 mt-2 border-top-1 surface-border">
                <pv-button type="submit" :label="t('hotelPaymentSettings.save')" icon="pi pi-check" class="w-auto" :loading="store.saving" />
              </div>
            </form>
          </template>
        </pv-card>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useHotelPaymentSettingsStore } from '@/accommodations/application/hotel-payment-settings.store.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { validatePaymentSettings } from '@/accommodations/domain/payment-settings-rules.js';
import useIamStore from '@/iam/application/iam.store.js';
import { canManageHotel, canViewHotelPaymentSettings } from '@/iam/domain/user-role.js';
import { failureMessageKey, violationMessages } from '@/shared/presentation/utils/failure-message.js';

/**
 * Payment methods of a hotel (US-53, US-51): the account holder plus Yape, Plin and/or a bank account. Guests see
 * them in their Pending booking and in the booking e-mail; a hotel without any method does not accept bookings.
 * The admin of the hotel and a chain_admin edit them; the reception of the hotel only reads them.
 */
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const store = useHotelPaymentSettingsStore();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

const hotelId = Number(route.params.hotelId);
const justRegistered = route.query.setup === '1';
const loadingData = ref(true);
const loadError = ref('');
const errorMessage = ref('');
const errors = ref({});
const form = reactive({ accountHolder: '', yapeNumber: '', plinNumber: '', bankName: '', bankAccountNumber: '', bankAccountCci: '' });

const canEdit = computed(() => canManageHotel(iamStore.currentUser, hotelId));
const accepts = computed(() => store.acceptsBookings(hotelId) === true);
const hotelName = computed(() => hotelStore.currentHotel?.id === hotelId ? hotelStore.currentHotel.name : '');

const goBack = () => router.push({ name: canEdit.value ? 'staff-hotels' : 'staff-dashboard' });

onMounted(async () => {
  if (!canViewHotelPaymentSettings(iamStore.currentUser, hotelId)) {
    loadError.value = t('staffHotels.outOfScope');
    loadingData.value = false;
    return;
  }
  try {
    const [settings] = await Promise.all([store.load(hotelId), hotelStore.fetchHotelById(hotelId)]);
    fill(settings);
  } catch (failure) {
    loadError.value = t(failureMessageKey(failure, { forbidden: 'staffHotels.outOfScope', notFound: 'staffHotels.notFound' }));
  } finally {
    loadingData.value = false;
  }
});

function fill(settings) {
  for (const key of Object.keys(form)) form[key] = settings?.[key] ?? '';
}

async function submit() {
  errorMessage.value = '';
  const invalid = validatePaymentSettings(form);
  errors.value = violationMessages(t, invalid, 'hotelPaymentSettings.rules');
  if (Object.keys(invalid).length > 0) return;

  try {
    const settings = await store.save(hotelId, form);
    fill(settings);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('hotelPaymentSettings.saved'), life: 3000 });
  } catch (failure) {
    if (failure.hasFieldViolations) errors.value = violationMessages(t, failure.fieldViolations, 'hotelPaymentSettings.rules');
    else errorMessage.value = t(failureMessageKey(failure, { forbidden: 'staffHotels.outOfScope', notFound: 'staffHotels.notFound' }));
  }
}
</script>
