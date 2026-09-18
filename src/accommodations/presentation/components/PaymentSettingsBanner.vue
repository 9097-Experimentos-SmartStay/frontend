<template>
  <pv-message v-if="visible" severity="warn" class="mb-4">
    <div class="flex flex-wrap align-items-center justify-content-between gap-2 w-full">
      <span>{{ t('hotelPaymentSettings.banner') }}</span>
      <pv-button
          :label="t('hotelPaymentSettings.configure')"
          icon="pi pi-wallet"
          class="p-button-sm p-button-warning"
          @click="router.push({ name: 'hotel-payment-settings', params: { hotelId } })"
      />
    </div>
  </pv-message>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHotelPaymentSettingsStore } from '@/accommodations/application/hotel-payment-settings.store.js';
import useIamStore from '@/iam/application/iam.store.js';
import { UserRole } from '@/iam/domain/user-role.js';

/**
 * Warns the admin of a hotel that has no payment methods yet: guests cannot book it until they are configured
 * (409 `booking.hotel_payment_settings_missing`). Only for an admin with a hotel; renders nothing otherwise or
 * while the settings are unknown.
 */
const router = useRouter();
const { t } = useI18n();
const store = useHotelPaymentSettingsStore();
const iamStore = useIamStore();

const hotelId = computed(() => (iamStore.role === UserRole.ADMIN ? iamStore.currentUser?.hotelId ?? null : null));
const visible = computed(() => hotelId.value != null && store.acceptsBookings(hotelId.value) === false);

onMounted(() => {
  if (hotelId.value != null) store.load(hotelId.value).catch(() => {});
});
</script>
