<template>
  <div class="p-4 md:p-6">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog />

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex flex-wrap gap-3 justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" :aria-label="t('common.back')" @click="goBack" />
        <div>
          <h1 class="text-2xl font-bold text-color m-0">{{ t('staffHotels.title') }}</h1>
          <p class="text-color-secondary m-0">{{ subtitle }}</p>
        </div>
      </div>
      <pv-button v-if="canRegister" :label="t('staffHotels.newHotel')" icon="pi pi-plus" @click="router.push({ name: 'create-hotel' })" />
    </div>

    <div class="surface-card p-4 shadow-2 border-round">
      <pv-data-table :value="hotelStore.hotels" :loading="hotelStore.loading" responsive-layout="scroll" paginator :rows="10" class="p-datatable-sm">
        <template #empty>{{ t('staffHotels.empty') }}</template>

        <pv-column field="id" header="ID" sortable style="width: 80px" />

        <pv-column :header="t('staffHotels.property')" sortable field="name">
          <template #body="{ data }">
            <div class="flex align-items-center gap-3">
              <div class="w-3rem h-3rem border-circle overflow-hidden surface-ground border-1 surface-border flex align-items-center justify-content-center">
                <img v-if="data.photoUrl" :src="data.photoUrl" class="w-full h-full object-cover" :alt="data.name" />
                <i v-else class="pi pi-building text-color-secondary"></i>
              </div>
              <div class="flex flex-column">
                <span class="font-bold text-color">
                  {{ data.name }}
                  <pv-tag v-if="data.id === currentUser?.hotelId" :value="t('staffHotels.yourHotel')" severity="info" class="ml-1" />
                </span>
                <span class="text-sm text-color-secondary">{{ data.type }}</span>
              </div>
            </div>
          </template>
        </pv-column>

        <pv-column field="location" :header="t('staffHotels.location')" sortable>
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-map-marker text-primary"></i>
              <span class="text-color">{{ data.location }}</span>
            </div>
          </template>
        </pv-column>

        <pv-column field="basePrice" :header="t('staffHotels.fromPrice')" sortable>
          <template #body="{ data }">
            <span class="font-medium text-color">{{ formatMoney(data.basePrice, locale) }}</span>
          </template>
        </pv-column>

        <pv-column :header="t('common.actions')" style="width: 190px">
          <template #body="{ data }">
            <div v-if="canManage(data)" class="flex gap-2">
              <pv-button icon="pi pi-wallet" class="p-button-rounded p-button-text p-button-warning" :aria-label="t('hotelPaymentSettings.title')" v-tooltip="t('hotelPaymentSettings.title')" @click="router.push({ name: 'hotel-payment-settings', params: { hotelId: data.id } })" />
              <pv-button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info" :aria-label="t('common.edit')" v-tooltip="t('common.edit')" @click="router.push({ name: 'edit-hotel', params: { hotelId: data.id } })" />
              <pv-button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" :aria-label="t('common.delete')" v-tooltip="t('common.delete')" @click="confirmDelete(data)" />
            </div>
            <pv-button v-else-if="canViewPayments(data)" icon="pi pi-wallet" class="p-button-rounded p-button-text p-button-warning" :aria-label="t('hotelPaymentSettings.title')" v-tooltip="t('hotelPaymentSettings.title')" @click="router.push({ name: 'hotel-payment-settings', params: { hotelId: data.id } })" />
          </template>
        </pv-column>
      </pv-data-table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import useIamStore from '@/iam/application/iam.store.js';
import { UserRole, canManageHotel, canRegisterHotel, canViewHotelPaymentSettings } from '@/iam/domain/user-role.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';

/**
 * Hotels of the staff area. Every staff role can read them; an admin edits only their hotel
 * and registers at most one (D2); a chain_admin manages all of them.
 */
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const { t, locale } = useI18n();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

const currentUser = computed(() => iamStore.currentUser);
const canRegister = computed(() => canRegisterHotel(currentUser.value));
const subtitle = computed(() => {
  if (iamStore.role === UserRole.ADMIN && currentUser.value?.hotelId == null) return t('staffHotels.subtitleNoHotel');
  return iamStore.role === UserRole.CHAIN_ADMIN ? t('staffHotels.subtitleChain') : t('staffHotels.subtitle');
});

const canManage = (hotel) => canManageHotel(currentUser.value, hotel.id);
const canViewPayments = (hotel) => canViewHotelPaymentSettings(currentUser.value, hotel.id);

onMounted(() => hotelStore.fetchAllHotels());

const goBack = () => router.push({ name: 'staff-dashboard' });

function confirmDelete(hotel) {
  confirm.require({
    header: t('staffHotels.deleteHeader'),
    message: t('staffHotels.deleteMessage', { name: hotel.name }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    accept: async () => {
      try {
        await hotelStore.deleteHotel(hotel.id);
        toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffHotels.deleted'), life: 3000 });
      } catch (err) {
        // 409: some room of the hotel still has pending, confirmed or checked-in bookings (US-53).
        toast.add({
          severity: 'error',
          summary: t('common.error'),
          detail: t(failureMessageKey(err, { hasActiveBookings: 'staffHotels.deleteBlocked', forbidden: 'staffHotels.outOfScope' }), { name: hotel.name }),
          life: 6000,
        });
      }
    },
  });
}
</script>
