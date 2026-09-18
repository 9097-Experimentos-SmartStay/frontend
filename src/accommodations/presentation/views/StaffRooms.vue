<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog />

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex flex-wrap gap-3 justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" :aria-label="t('common.back')" @click="goBack" />
        <div>
          <h1 class="text-2xl font-bold text-color m-0">{{ t('staffRooms.title') }}</h1>
          <p class="text-color-secondary m-0">{{ t('staffRooms.subtitle') }}</p>
        </div>
      </div>
      <pv-button v-if="canManageRooms" :label="t('staffRooms.newRoom')" icon="pi pi-plus" class="p-button-success" @click="router.push({ name: 'create-room' })" />
    </div>

    <div class="surface-card p-4 shadow-2 border-round">
      <pv-data-table :value="roomStore.rooms" :loading="roomStore.loading" responsive-layout="scroll" paginator :rows="10" class="p-datatable-sm">
        <template #empty>{{ t('staffRooms.empty') }}</template>

        <pv-column field="number" :header="t('staffRooms.number')" sortable style="width: 120px">
          <template #body="{ data }">
            <span class="font-bold text-lg text-primary">{{ data.label }}</span>
          </template>
        </pv-column>

        <pv-column field="hotelId" :header="t('staffRooms.hotel')" sortable>
          <template #body="{ data }">{{ hotelName(data.hotelId) }}</template>
        </pv-column>

        <pv-column field="roomTypeName" :header="t('staffRooms.type')" sortable>
          <template #body="{ data }">
            <pv-tag :value="data.roomTypeName" severity="info" />
          </template>
        </pv-column>

        <pv-column field="price" :header="t('staffRooms.pricePerNight')" sortable>
          <template #body="{ data }">{{ formatMoney(data.price, locale) }}</template>
        </pv-column>

        <pv-column field="description" :header="t('staffRooms.description')">
          <template #body="{ data }">
            <span class="text-color-secondary text-sm">{{ truncate(data.description, 50) }}</span>
          </template>
        </pv-column>

        <!-- Real status of the room (US-29); nothing is shown when the API does not send it -->
        <pv-column field="status" :header="t('staffRooms.status')" sortable style="width: 140px">
          <template #body="{ data }">
            <pv-tag v-if="data.status" :value="t(`staffRooms.statuses.${data.status}`)" :severity="statusSeverity(data.status)" rounded />
            <span v-else class="text-color-secondary">—</span>
          </template>
        </pv-column>

        <pv-column v-if="canManageRooms" :header="t('common.actions')" style="width: 150px">
          <template #body="{ data }">
            <div v-if="canManageHotel(currentUser, data.hotelId)" class="flex gap-2">
              <pv-button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info" :aria-label="t('common.edit')" v-tooltip="t('common.edit')" @click="router.push({ name: 'edit-room', params: { roomId: data.id } })" />
              <pv-button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" :aria-label="t('common.delete')" v-tooltip="t('common.delete')" @click="confirmDelete(data)" />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <!-- US-53 scenario 2: the shared catalog of room types that classifies the rooms -->
    <div class="surface-card p-4 shadow-2 border-round mt-4">
      <div class="flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 class="text-xl font-bold text-color m-0">{{ t('roomTypes.title') }}</h2>
          <p class="text-color-secondary m-0">{{ t('roomTypes.subtitle') }}</p>
        </div>
        <pv-button v-if="canCreateRoomTypes" :label="t('roomTypes.new')" icon="pi pi-plus" class="p-button-outlined" @click="isTypeDialogVisible = true" />
      </div>
      <pv-data-table :value="roomStore.roomTypes" responsive-layout="scroll" class="p-datatable-sm" :rows="5" paginator>
        <template #empty>{{ t('roomTypes.empty') }}</template>
        <pv-column field="name" :header="t('masterData.name')" sortable />
        <pv-column field="description" :header="t('staffRooms.description')" />
      </pv-data-table>
    </div>

    <AddRoomTypeDialog v-model="isTypeDialogVisible" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { RoomStatus } from '@/accommodations/domain/model/room.entity.js';
import useIamStore from '@/iam/application/iam.store.js';
import { Capability, canManageHotel } from '@/iam/domain/user-role.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';
import AddRoomTypeDialog from '../components/AddRoomTypeDialog.vue';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';

/**
 * Room inventory of the staff area. Every staff role reads it; admin (own hotel) and chain_admin manage it.
 */
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const { t, locale } = useI18n();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

const currentUser = computed(() => iamStore.currentUser);
const canManageRooms = computed(() => iamStore.can(Capability.MANAGE_ROOMS));
const canCreateRoomTypes = computed(() => iamStore.can(Capability.CREATE_ROOM_TYPES));
const isTypeDialogVisible = ref(false);

const STATUS_SEVERITY = {
  [RoomStatus.AVAILABLE]: 'success',
  [RoomStatus.OCCUPIED]: 'info',
  [RoomStatus.CLEANING]: 'warn',
  [RoomStatus.MAINTENANCE]: 'danger',
};
const statusSeverity = (status) => STATUS_SEVERITY[status] ?? 'secondary';
const hotelName = (hotelId) => hotelStore.hotels.find((hotel) => hotel.id === hotelId)?.name ?? `#${hotelId}`;
const truncate = (text, length) => (!text ? '' : text.length > length ? `${text.substring(0, length)}…` : text);

onMounted(() => Promise.all([roomStore.fetchAllRooms(), hotelStore.fetchAllHotels(), roomStore.fetchAllRoomTypes()]));

const goBack = () => router.push({ name: 'staff-dashboard' });

function confirmDelete(room) {
  confirm.require({
    header: t('staffRooms.deleteHeader'),
    message: t('staffRooms.deleteMessage', { number: room.label }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    accept: async () => {
      try {
        await roomStore.deleteRoom(room.id);
        toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffRooms.deleted'), life: 3000 });
      } catch (err) {
        // 409: the room still has pending, confirmed or checked-in bookings (US-53 scenario 4).
        toast.add({
          severity: 'error',
          summary: t('common.error'),
          detail: t(failureMessageKey(err, { hasActiveBookings: 'staffRooms.deleteBlocked', forbidden: 'staffHotels.outOfScope' }), { number: room.label }),
          life: 6000,
        });
      }
    },
  });
}
</script>
