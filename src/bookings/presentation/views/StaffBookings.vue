<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="flex justify-content-between align-items-center mb-6">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="goBack" />
        <h1 class="text-3xl font-bold text-color m-0">{{ t('staffBookings.title') }}</h1>
      </div>
    </div>

    <div v-if="bookingStore.loading && !bookingStore.bookings.length" class="flex justify-content-center p-8">
      <pv-progress-spinner />
    </div>

    <pv-data-table
        v-else-if="bookingStore.bookings.length"
        :value="bookingStore.bookings"
        responsive-layout="scroll"
        class="shadow-2 border-round-xl overflow-hidden"
        paginator :rows="10"
    >
      <template #header>
        <div class="flex align-items-center justify-content-between p-3 surface-card border-bottom-1 surface-border">
          <span class="text-xl font-bold text-color">{{ t('staffBookings.all') }}</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" :aria-label="t('common.refresh')" v-tooltip="t('common.refresh')" @click="fetchData" />
        </div>
      </template>

      <pv-column field="id" header="ID" sortable style="width: 80px"></pv-column>

      <pv-column field="guestName" :header="t('staffBookings.guest')" sortable>
        <template #body="{ data }">
          <div class="flex flex-column">
            <span class="font-bold text-color">{{ data.guestName }}</span>
            <span class="text-sm text-color-secondary">{{ data.guestEmail }}</span>
          </div>
        </template>
      </pv-column>

      <pv-column field="roomId" :header="t('staffBookings.room')" sortable>
        <template #body="{ data }">
          <span class="text-primary font-medium">#{{ data.roomId }}</span>
        </template>
      </pv-column>

      <pv-column :header="t('staffBookings.dates')">
        <template #body="{ data }">
          <div class="text-sm">
            <div class="text-color"><i class="pi pi-calendar-plus text-green-500 mr-2"></i>{{ formatDay(data.checkInDate, locale) }}</div>
            <div class="text-color"><i class="pi pi-calendar-minus text-red-500 mr-2"></i>{{ formatDay(data.checkOutDate, locale) }}</div>
            <div class="text-color-secondary">{{ t('staffBookings.nights', { count: data.nights }, data.nights) }}</div>
          </div>
        </template>
      </pv-column>

      <pv-column field="status" :header="t('staffBookings.status')" sortable>
        <template #body="{ data }">
          <pv-tag :value="bookingStatusLabel(t, data.status)" :severity="bookingStatusSeverity(data.status)" rounded />
        </template>
      </pv-column>

      <pv-column v-if="canConfirm || canCancel" :header="t('common.actions')" style="width: 160px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <pv-button
                v-if="canConfirm && data.isPending()"
                icon="pi pi-check"
                class="p-button-rounded p-button-success p-button-text"
                v-tooltip="t('staffBookings.confirm')"
                :aria-label="t('staffBookings.confirm')"
                @click="confirmBooking(data.id)"
            />
            <pv-button
                v-if="canCancel && data.canBeCancelled()"
                icon="pi pi-times"
                class="p-button-rounded p-button-danger p-button-text"
                v-tooltip="t('staffBookings.cancel')"
                :aria-label="t('staffBookings.cancel')"
                @click="cancelBooking(data.id)"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 surface-card border-round-xl border-1 surface-border shadow-1">
      <i class="pi pi-calendar-times text-500 text-6xl mb-4"></i>
      <h3 class="text-color font-bold m-0 mb-2">{{ t('staffBookings.empty') }}</h3>
      <p class="text-color-secondary">{{ t('staffBookings.emptyHint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useBookingStore } from '../../application/booking.store.js';
import { bookingStatusLabel, bookingStatusSeverity } from '../utils/booking-status.js';
import { formatDay } from '@/shared/presentation/utils/formatters.js';
import { apiErrorKey } from '@/shared/presentation/utils/api-error.js';
import useIamStore from '@/iam/application/iam.store.js';
import { Capability } from '@/iam/domain/user-role.js';

/**
 * Bookings of the staff area. Every staff role can read them; confirming and cancelling is
 * reserved to reception, admin and chain_admin (role matrix).
 */
const router = useRouter();
const toast = useToast();
const { t, locale } = useI18n();
const bookingStore = useBookingStore();
const iamStore = useIamStore();

const canConfirm = computed(() => iamStore.can(Capability.CONFIRM_BOOKINGS));
const canCancel = computed(() => iamStore.can(Capability.CANCEL_BOOKINGS));

const fetchData = () => bookingStore.fetchBookings();

onMounted(fetchData);

const goBack = () => router.push({ name: 'staff-dashboard' });

async function confirmBooking(bookingId) {
  try {
    await bookingStore.confirmBooking(bookingId);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffBookings.confirmed'), life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t(apiErrorKey(err, { 409: 'staffBookings.confirmConflict' })), life: 4000 });
  }
}

async function cancelBooking(bookingId) {
  try {
    await bookingStore.cancelBooking(bookingId);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffBookings.cancelled'), life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t(apiErrorKey(err, { 409: 'staffBookings.cancelConflict' })), life: 4000 });
  }
}
</script>