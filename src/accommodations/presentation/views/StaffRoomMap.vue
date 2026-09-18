<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex flex-wrap gap-3 justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" :aria-label="t('common.back')" @click="router.push({ name: 'staff-dashboard' })" />
        <div>
          <h1 class="text-2xl font-bold text-color m-0">{{ t('roomMap.title') }}</h1>
          <p class="text-color-secondary m-0">{{ store.roomMap?.hotelName || t('roomMap.subtitle') }}</p>
        </div>
      </div>
      <div class="flex flex-wrap align-items-center gap-2">
        <!-- A chain_admin picks the hotel (hotelId is required for them) -->
        <pv-select
            v-if="isChainAdmin"
            v-model="selectedHotelId"
            :options="hotelStore.hotels"
            option-label="name"
            option-value="id"
            :placeholder="t('roomMap.chooseHotel')"
            class="w-full md:w-16rem"
            @change="load"
        />
        <pv-button icon="pi pi-refresh" class="p-button-outlined" :label="t('common.refresh')" :loading="store.loadingMap" @click="load" />
      </div>
    </div>

    <pv-message v-if="errorMessage" severity="warn" class="mb-4">{{ errorMessage }}</pv-message>

    <template v-if="store.roomMap">
      <!-- Legend with the count per status -->
      <div class="flex flex-wrap gap-2 mb-3" role="list" :aria-label="t('roomMap.legend')">
        <span v-for="(count, status) in store.roomMap.summary" :key="status" role="listitem" class="legend-chip" :class="roomStatusTileClass(status)">
          <i :class="roomStatusIcon(status)"></i> {{ roomStatusLabel(t, status) }}: <strong>{{ count }}</strong>
        </span>
        <span v-if="store.roomMap.overdueCount" class="legend-chip overdue-chip" role="listitem">
          <i class="pi pi-exclamation-triangle"></i> {{ t('roomMap.overdueCount', { count: store.roomMap.overdueCount }, store.roomMap.overdueCount) }}
        </span>
      </div>
      <small class="block text-color-secondary mb-3">{{ t('roomMap.updatedAt', { time: formatDateTime(store.roomMap.generatedAt, locale) }) }}</small>

      <div v-if="store.roomMap.rooms.length" class="room-grid">
        <button
            v-for="room in store.roomMap.rooms"
            :key="room.id"
            type="button"
            class="room-tile"
            :class="roomStatusTileClass(room.status)"
            :aria-label="t('roomMap.tileLabel', { number: room.label, status: roomStatusLabel(t, room.status) })"
            @click="openRoom(room.id)"
        >
          <span class="room-number">{{ room.label }}</span>
          <span class="room-type">{{ room.roomTypeName }}</span>
          <span class="room-status"><i :class="roomStatusIcon(room.status)"></i> {{ roomStatusLabel(t, room.status) }}</span>
          <span class="room-time"><i class="pi pi-clock"></i> {{ formatDuration(t, room.minutesInStatus(now)) }}</span>
          <span v-if="room.maintenanceOverdue" class="overdue-badge">{{ t('roomMap.overdue') }}</span>
        </button>
      </div>
      <div v-else class="surface-card p-5 border-round text-center text-color-secondary">{{ t('roomMap.empty') }}</div>
    </template>

    <div v-else-if="store.loadingMap" class="flex justify-content-center p-8"><pv-progress-spinner /></div>

    <RoomStatusDialog
        v-model:visible="dialogVisible"
        :room="selectedRoom"
        :can-change-status="canChangeStatus"
        :now="now"
        @changed="onStatusChanged"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useRoomOperationsStore } from '../../application/room-operations.store.js';
import { useHotelStore } from '../../application/hotel.store.js';
import RoomStatusDialog from '../components/RoomStatusDialog.vue';
import { formatDuration, roomStatusIcon, roomStatusLabel, roomStatusTileClass } from '../utils/room-status-style.js';
import useIamStore from '@/iam/application/iam.store.js';
import { Capability, UserRole } from '@/iam/domain/user-role.js';
import { formatDateTime } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/**
 * US-06: room map of a hotel with color codes, time in status and the maintenance alert (> 24 h);
 * a click opens the room to change its status (allowed transitions only) and see its history.
 * Reception, housekeeping, maintenance and admin see their hotel; a chain_admin chooses one.
 */
const router = useRouter();
const { t, locale } = useI18n();
const toast = useToast();
const store = useRoomOperationsStore();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

const isChainAdmin = computed(() => iamStore.role === UserRole.CHAIN_ADMIN);
const canChangeStatus = computed(() => iamStore.can(Capability.CHANGE_ROOM_STATUS));
const selectedHotelId = ref(null);
const selectedRoomId = ref(null);
const dialogVisible = ref(false);
const errorMessage = ref('');
const now = ref(new Date());
let clock = null;

const selectedRoom = computed(() => store.roomMap?.find(selectedRoomId.value) ?? null);

async function load() {
  errorMessage.value = '';
  if (isChainAdmin.value && !selectedHotelId.value) {
    errorMessage.value = t('roomMap.chooseHotelHint');
    return;
  }
  try {
    await store.fetchMap(isChainAdmin.value ? selectedHotelId.value : null);
    now.value = new Date();
  } catch (failure) {
    errorMessage.value = t(failureMessageKey(failure, {
      forbidden: 'roomMap.forbidden',
      invalidData: 'roomMap.noHotel',
      notFound: 'roomMap.noHotel',
    }));
  }
}

function openRoom(roomId) {
  selectedRoomId.value = roomId;
  dialogVisible.value = true;
}

function onStatusChanged({ status }) {
  toast.add({
    severity: 'success',
    summary: t('common.success'),
    detail: t('roomMap.changed', { number: selectedRoom.value?.label ?? '', status: roomStatusLabel(t, status) }),
    life: 4000,
  });
}

onMounted(async () => {
  if (isChainAdmin.value) {
    await hotelStore.fetchAllHotels();
    selectedHotelId.value = iamStore.currentUser?.hotelId ?? hotelStore.hotels[0]?.id ?? null;
  }
  await load();
  // Time in status moves on by itself; the map is reloaded every 2 minutes to show changes made by others.
  let ticks = 0;
  clock = setInterval(() => {
    now.value = new Date();
    ticks += 1;
    if (ticks % 4 === 0 && !dialogVisible.value) load();
  }, 30 * 1000);
});

onBeforeUnmount(() => clearInterval(clock));
</script>

<style scoped>
.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: 0.75rem;
}
.room-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.85rem;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.room-tile:hover,
.room-tile:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
  outline: none;
}
.room-number {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.1;
}
.room-type,
.room-time {
  font-size: 0.8rem;
  opacity: 0.9;
}
.room-status {
  font-weight: 600;
  font-size: 0.9rem;
}
.overdue-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #b91c1c;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.85rem;
}
.overdue-chip {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #b91c1c;
}
/* Disponible green, Ocupada red, Limpieza yellow, Mantenimiento dark gray */
.status-available {
  background: #dcfce7;
  color: #14532d;
  border-color: #16a34a;
}
.status-occupied {
  background: #fee2e2;
  color: #7f1d1d;
  border-color: #dc2626;
}
.status-cleaning {
  background: #fef9c3;
  color: #713f12;
  border-color: #eab308;
}
.status-maintenance {
  background: #374151;
  color: #f9fafb;
  border-color: #111827;
}
</style>
