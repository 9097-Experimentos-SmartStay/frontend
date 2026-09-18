<template>
  <pv-dialog
      :visible="visible"
      modal
      :header="room ? t('roomMap.dialogTitle', { number: room.label }) : ''"
      :style="{ width: '40rem' }"
      :breakpoints="{ '768px': '95vw' }"
      @update:visible="emit('update:visible', $event)"
      @show="loadHistory"
  >
    <template v-if="room">
      <div class="flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="text-color-secondary">{{ room.roomTypeName }}</div>
          <div class="text-sm text-color-secondary">{{ room.description }}</div>
        </div>
        <div class="text-right">
          <pv-tag :value="roomStatusLabel(t, room.status)" :severity="roomStatusSeverity(room.status)" :icon="roomStatusIcon(room.status)" rounded />
          <div class="text-sm text-color-secondary mt-1">{{ t('roomMap.since', { time: formatDateTime(room.statusSince, locale), duration: formatDuration(t, room.minutesInStatus(now)) }) }}</div>
        </div>
      </div>

      <pv-message v-if="room.maintenanceOverdue" severity="error" class="mb-3">{{ t('roomMap.overdueDetail') }}</pv-message>

      <!-- US-06 scenario 1: only the statuses the API allows from the current one -->
      <section v-if="canChangeStatus" class="mb-4">
        <h3 class="text-base font-semibold mb-2">{{ t('roomMap.changeTo') }}</h3>
        <div v-if="room.allowedNextStatuses.length" class="flex flex-wrap gap-2">
          <pv-button
              v-for="status in room.allowedNextStatuses"
              :key="status"
              :label="roomStatusLabel(t, status)"
              :icon="roomStatusIcon(status)"
              :severity="roomStatusSeverity(status)"
              outlined
              :loading="store.changingStatus && pendingStatus === status"
              :disabled="store.changingStatus"
              @click="changeTo(status)"
          />
        </div>
        <small v-else class="text-color-secondary">{{ t('roomMap.noTransitions') }}</small>
        <small class="block text-color-secondary mt-2">{{ t('roomMap.notifyHint') }}</small>
        <pv-message v-if="errorMessage" severity="error" class="mt-2">{{ errorMessage }}</pv-message>
      </section>

      <!-- US-06 scenario 3: history (date, time, user, from → to) -->
      <section>
        <h3 class="text-base font-semibold mb-2">{{ t('roomMap.history') }}</h3>
        <pv-data-table :value="store.history" :loading="store.loadingHistory" class="p-datatable-sm" scrollable scroll-height="18rem">
          <template #empty>{{ t('roomMap.historyEmpty') }}</template>
          <pv-column :header="t('roomMap.historyWhen')">
            <template #body="{ data }">{{ formatDateTime(data.changedAt, locale) }}</template>
          </pv-column>
          <pv-column :header="t('roomMap.historyChange')">
            <template #body="{ data }">
              <span class="white-space-nowrap">{{ roomStatusLabel(t, data.fromStatus) }} <i class="pi pi-arrow-right text-xs mx-1"></i> {{ roomStatusLabel(t, data.toStatus) }}</span>
            </template>
          </pv-column>
          <pv-column :header="t('roomMap.historyWho')">
            <template #body="{ data }">
              <span>{{ data.changedByEmail ?? t('roomMap.system') }}</span>
              <small v-if="data.origin && data.origin !== 'Staff'" class="block text-color-secondary">{{ t(`roomMap.origins.${data.origin}`, data.origin) }}</small>
            </template>
          </pv-column>
        </pv-data-table>
        <small v-if="historyError" class="p-error block mt-2">{{ historyError }}</small>
      </section>
    </template>
  </pv-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoomOperationsStore } from '../../application/room-operations.store.js';
import { formatDuration, roomStatusIcon, roomStatusLabel, roomStatusSeverity } from '../utils/room-status-style.js';
import { formatDateTime } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/**
 * A room of the map: its status, a quick change to one of the allowed next statuses, and its history.
 */
const props = defineProps({
  visible: { type: Boolean, default: false },
  /** @type {import('../../domain/model/room-map.js').RoomMapEntry} */
  room: { type: Object, default: null },
  canChangeStatus: { type: Boolean, default: false },
  /** Current time, refreshed by the map (time in status). */
  now: { type: Date, default: () => new Date() },
});
const emit = defineEmits(['update:visible', 'changed']);
const { t, locale } = useI18n();
const store = useRoomOperationsStore();

const pendingStatus = ref(null);
const errorMessage = ref('');
const historyError = ref('');

async function loadHistory() {
  errorMessage.value = '';
  historyError.value = '';
  if (!props.room) return;
  try {
    await store.fetchHistory(props.room.id);
  } catch (failure) {
    historyError.value = t(failureMessageKey(failure));
  }
}

async function changeTo(status) {
  errorMessage.value = '';
  pendingStatus.value = status;
  try {
    await store.changeStatus(props.room.id, status);
    emit('changed', { roomId: props.room.id, status });
    await loadHistory();
  } catch (failure) {
    errorMessage.value = t(failureMessageKey(failure, {
      invalidStatusTransition: 'roomMap.invalidTransition',
      forbidden: 'roomMap.forbidden',
    }));
  } finally {
    pendingStatus.value = null;
  }
}
</script>
