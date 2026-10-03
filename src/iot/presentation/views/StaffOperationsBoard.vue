<template>
  <div class="p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-7xl mx-auto">
      <div class="flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h1 class="text-3xl font-bold text-color m-0">{{ t('climate.board.title') }}</h1>
          <p class="text-color-secondary m-0 mt-1">{{ t('climate.board.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap align-items-center gap-2">
          <!-- A chain_admin works across hotels, so the board asks which one -->
          <pv-select
              v-if="isChainAdmin"
              v-model="hotelId"
              :options="hotelOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('roomMap.chooseHotel')"
              class="w-18rem"
              @change="load"
          />
          <pv-button
              icon="pi pi-refresh"
              :label="t('common.refresh')"
              class="p-button-outlined"
              :loading="loading"
              :disabled="!hotelRooms.length"
              @click="load"
          />
        </div>
      </div>

      <pv-message v-if="climateStore.unavailable" severity="info" :closable="false" class="mb-4">
        {{ t('climate.unavailable') }}
      </pv-message>

      <pv-message v-if="isChainAdmin && !hotelId" severity="info" :closable="false" class="mb-4">
        {{ t('roomMap.chooseHotelHint') }}
      </pv-message>

      <pv-message v-else-if="!isChainAdmin && !ownHotelId" severity="warn" :closable="false" class="mb-4">
        {{ t('climate.board.noHotel') }}
      </pv-message>

      <template v-else>
        <!-- Counters: what the shift should look at -->
        <div class="grid mb-4">
          <div v-for="tile in tiles" :key="tile.key" class="col-6 md:col-3">
            <div class="surface-card shadow-1 border-round-xl p-3 h-full">
              <span class="block text-500 font-medium mb-2">{{ tile.label }}</span>
              <div class="text-3xl font-bold" :class="tile.tone">{{ loading ? '…' : tile.value }}</div>
            </div>
          </div>
        </div>

        <!-- Today's movements come from the bookings the role can already read -->
        <div class="surface-card shadow-1 border-round-xl p-3 mb-4">
          <h2 class="text-lg font-semibold text-color mt-0 mb-2">{{ t('climate.board.todayTitle') }}</h2>
          <div class="flex flex-wrap gap-4 text-sm">
            <span><i class="pi pi-sign-in text-green-700 mr-2"></i>{{ t('climate.board.arrivals', { count: arrivals.length }) }}</span>
            <span><i class="pi pi-sign-out text-red-700 mr-2"></i>{{ t('climate.board.departures', { count: departures.length }) }}</span>
            <span><i class="pi pi-home mr-2"></i>{{ t('climate.board.staying', { count: staying.length }) }}</span>
          </div>
        </div>

        <div class="flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div class="flex align-items-center gap-2">
            <pv-checkbox v-model="onlyAttention" input-id="onlyAttention" binary />
            <label for="onlyAttention" class="cursor-pointer">{{ t('climate.board.onlyAttention') }}</label>
          </div>
          <span class="text-sm text-color-secondary">{{ t('climate.board.roomCount', { count: visibleRooms.length }) }}</span>
        </div>

        <div v-if="loading && !hotelRooms.length" class="flex justify-content-center p-8">
          <pv-progress-spinner />
        </div>

        <div v-else-if="!visibleRooms.length" class="surface-card shadow-1 border-round-xl p-6 text-center">
          <p class="text-color-secondary m-0">
            {{ onlyAttention ? t('climate.board.nothingToAttend') : t('climate.board.noRooms') }}
          </p>
        </div>

        <div v-else class="grid">
          <div v-for="room in visibleRooms" :key="room.id" class="col-12 sm:col-6 lg:col-4 xl:col-3">
            <button
                type="button"
                class="tile surface-card shadow-1 border-round-xl p-3 w-full text-left"
                :class="{ 'tile-attention': climateFor(room)?.needsAttention }"
                @click="openRoom(room)"
            >
              <div class="flex justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <span class="block text-lg font-bold text-color">{{ t('staffRooms.number') }} {{ room.label }}</span>
                  <span class="text-sm text-color-secondary">{{ room.roomTypeName }}</span>
                </div>
                <pv-tag
                    v-if="climateFor(room)"
                    :severity="comfortStyle(climateFor(room).comfort).severity"
                    :value="formatCelsius(climateFor(room).temperature, locale)"
                    rounded
                />
                <pv-tag v-else severity="secondary" :value="t('common.notAvailable')" rounded />
              </div>

              <div v-if="climateFor(room)" class="flex flex-wrap gap-1">
                <pv-tag
                    v-if="!climateFor(room).motionDetected"
                    severity="secondary"
                    icon="pi pi-eye-slash"
                    :value="t('climate.motion.none')"
                    rounded
                />
                <pv-tag
                    v-if="climateFor(room).isWastingEnergy"
                    severity="warn"
                    icon="pi pi-bolt"
                    :value="t('climate.board.wastingEnergy')"
                    rounded
                />
                <pv-tag
                    v-if="climateFor(room).isHardwareAltered"
                    severity="danger"
                    icon="pi pi-exclamation-triangle"
                    :value="t('climate.hardware.altered')"
                    rounded
                />
                <pv-tag
                    v-if="climateFor(room).isPowerSaving"
                    severity="info"
                    icon="pi pi-moon"
                    :value="t('climate.board.powerSavingShort')"
                    rounded
                />
              </div>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- One room: read its board, set the thermostat, or reproduce a sensor reading -->
    <pv-dialog
        v-model:visible="detail.visible"
        modal
        :header="detail.room ? t('climate.board.dialogTitle', { room: detail.room.label }) : ''"
        :style="{ width: '34rem' }"
        :breakpoints="{ '640px': '92vw' }"
    >
      <template v-if="detail.room">
        <dl class="readings mb-4">
          <dt>{{ t('climate.fields.temperature') }}</dt>
          <dd>{{ formatCelsius(detailClimate?.temperature ?? null, locale) }}</dd>
          <dt>{{ t('climate.fields.motion') }}</dt>
          <dd>{{ detailClimate?.motionDetected ? t('climate.motion.detected') : t('climate.motion.none') }}</dd>
          <dt>{{ t('climate.fields.hardware') }}</dt>
          <dd>{{ detailClimate?.hardwareStatus || '—' }}</dd>
          <dt>{{ t('climate.fields.lastCommand') }}</dt>
          <dd class="text-sm break-word">{{ detailClimate?.lastCommand || '—' }}</dd>
          <dt>{{ t('climate.fields.updatedAt') }}</dt>
          <dd class="text-sm">{{ formatDateTime(detailClimate?.measuredAt ?? null, locale) }}</dd>
        </dl>

        <template v-if="canOperateDevices">
          <h3 class="text-base font-semibold text-color mt-0 mb-2">{{ t('climate.thermostat.title') }}</h3>
          <ThermostatControl
              :room-id="detail.room.id"
              :current-temperature="detailClimate?.temperature ?? null"
              :saving="climateStore.saving"
              :disabled="climateStore.unavailable"
              @submit="applyThermostat"
          />
        </template>

        <!-- The emulator's own input: reproduce a situation without the physical board -->
        <div v-if="canInjectTelemetry" class="simulation mt-4 pt-3">
          <h3 class="text-base font-semibold text-color mt-0 mb-1">{{ t('climate.simulation.title') }}</h3>
          <p class="text-sm text-color-secondary mt-0 mb-3">{{ t('climate.simulation.hint') }}</p>
          <div class="flex flex-wrap gap-2">
            <pv-button
                :label="t('climate.simulation.emptyRoom')"
                icon="pi pi-eye-slash"
                class="p-button-sm p-button-outlined"
                :loading="climateStore.saving"
                :disabled="climateStore.unavailable"
                @click="simulate(SimulatedSensor.MOTION, NO_MOTION_READING)"
            />
            <pv-button
                :label="t('climate.simulation.occupiedRoom')"
                icon="pi pi-user"
                class="p-button-sm p-button-outlined"
                :loading="climateStore.saving"
                :disabled="climateStore.unavailable"
                @click="simulate(SimulatedSensor.MOTION, MOTION_READING)"
            />
            <pv-button
                :label="t('climate.simulation.heatwave')"
                icon="pi pi-sun"
                class="p-button-sm p-button-outlined"
                :loading="climateStore.saving"
                :disabled="climateStore.unavailable"
                @click="simulate(SimulatedSensor.TEMPERATURE, '29')"
            />
          </div>
        </div>
      </template>
    </pv-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import ThermostatControl from '../components/ThermostatControl.vue';
import useClimateStore from '../../application/climate.store.js';
import { IotFailureReason } from '../../application/iot-failure.js';
import { InjectTelemetryCommand, MOTION_READING, NO_MOTION_READING, SimulatedSensor } from '../../domain/commands/inject-telemetry.command.js';
import { comfortStyle, formatCelsius } from '../utils/climate-style.js';
import useIamStore from '@/iam/application/iam.store.js';
import { Capability, UserRole } from '@/iam/domain/user-role.js';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { useBookingStore } from '@/bookings/application/booking.store.js';
import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';
import { formatDateTime } from '@/shared/presentation/utils/formatters.js';

/**
 * Operations board of a hotel: the shift (housekeeping, maintenance, reception) sees the climate board
 * of every room next to today's movements, and can act on one room.
 *
 * Reception, housekeeping and maintenance had no screen of their own: they landed on the staff
 * dashboard, whose indicators are admin-only. This is that screen, built on what the API offers
 * today — the rooms of the hotel, the bookings the role may read, and the IoT emulator.
 */
const { t, locale } = useI18n();
const toast = useToast();
const iamStore = useIamStore();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();
const bookingStore = useBookingStore();
const climateStore = useClimateStore();

const onlyAttention = ref(false);
const hotelId = ref(null);
const detail = reactive({ visible: false, room: null });

const isChainAdmin = computed(() => iamStore.role === UserRole.CHAIN_ADMIN);
// Every staff role reads the board; reception and housekeeping only watch it (the API answers 403).
const canOperateDevices = computed(() => iamStore.can(Capability.OPERATE_ROOM_DEVICES));
const canInjectTelemetry = computed(() => iamStore.can(Capability.INJECT_ROOM_TELEMETRY));
const ownHotelId = computed(() => iamStore.currentUser?.hotelId ?? null);
const activeHotelId = computed(() => (isChainAdmin.value ? hotelId.value : ownHotelId.value));

const loading = computed(() => climateStore.loading || roomStore.loading);

const hotelOptions = computed(() => hotelStore.hotels.map((hotel) => ({ value: hotel.id, label: hotel.name })));

/** Rooms of the hotel in view. The API scopes nothing here, so the board filters by hotel itself. */
const hotelRooms = computed(() => {
  if (activeHotelId.value == null) return [];
  return roomStore.rooms
      .filter((room) => Number(room.hotelId) === Number(activeHotelId.value))
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
});

const climateFor = (room) => climateStore.climateFor(room.id);

const visibleRooms = computed(
    () => (onlyAttention.value ? hotelRooms.value.filter((room) => climateFor(room)?.needsAttention) : hotelRooms.value)
);

const detailClimate = computed(() => (detail.room ? climateStore.climateFor(detail.room.id) : null));

// --- Today's movements, from the bookings this role can read ---
const today = CalendarDate.today();
const roomIdsOfHotel = computed(() => new Set(hotelRooms.value.map((room) => room.id)));
const hotelBookings = computed(() => bookingStore.bookings.filter((booking) => roomIdsOfHotel.value.has(booking.roomId)));

const arrivals = computed(() => hotelBookings.value.filter((b) => b.isActive() && b.checkInDate?.equals(today)));
const departures = computed(() => hotelBookings.value.filter((b) => b.isActive() && b.checkOutDate?.equals(today)));
const staying = computed(() => hotelBookings.value.filter((b) => b.isActive() && b.stay.includesNight(today)));

const emptyRooms = computed(() => hotelRooms.value.filter((room) => climateFor(room)?.motionDetected === false).length);
const alteredRooms = computed(() => hotelRooms.value.filter((room) => climateFor(room)?.isHardwareAltered).length);

const tiles = computed(() => [
  { key: 'rooms', label: t('climate.board.tiles.rooms'), value: hotelRooms.value.length, tone: 'text-color' },
  { key: 'attention', label: t('climate.board.tiles.attention'), value: climateStore.roomsNeedingAttention, tone: 'text-orange-600' },
  { key: 'empty', label: t('climate.board.tiles.empty'), value: emptyRooms.value, tone: 'text-color-secondary' },
  { key: 'faults', label: t('climate.board.tiles.faults'), value: alteredRooms.value, tone: 'text-red-600' },
]);

async function load() {
  climateStore.clear();
  if (activeHotelId.value == null) return;
  // One request per room: the emulator has no list endpoint, so keep it to a single hotel.
  await climateStore.fetchClimateForRooms(hotelRooms.value.map((room) => room.id));
}

function openRoom(room) {
  Object.assign(detail, { visible: true, room });
}

function reportFailure(failure) {
  const key = failure?.reason === IotFailureReason.EMULATOR_NOT_AVAILABLE
      ? 'climate.unavailable'
      : failureMessageKey(failure);
  toast.add({ severity: 'error', summary: t('common.error'), detail: t(key), life: 5000 });
}

async function applyThermostat(command) {
  try {
    await climateStore.setThermostat(detail.room.id, command);
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('climate.thermostat.applied', { temperature: formatCelsius(command.targetTemperature, locale.value) }),
      life: 4000,
    });
  } catch (failure) {
    reportFailure(failure);
  }
}

async function simulate(sensor, reading) {
  const command = new InjectTelemetryCommand({ roomId: detail.room.id, sensor, reading });
  const violation = command.validate();
  if (violation) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t(`climate.rules.${violation.code}`), life: 5000 });
    return;
  }
  try {
    await climateStore.injectTelemetry(command);
    toast.add({ severity: 'success', summary: t('common.updated'), detail: t('climate.simulation.injected'), life: 3000 });
  } catch (failure) {
    reportFailure(failure);
  }
}

onMounted(async () => {
  await Promise.all([
    roomStore.rooms.length ? Promise.resolve() : roomStore.fetchAllRooms(),
    bookingStore.bookings.length ? Promise.resolve() : bookingStore.fetchBookings(),
    isChainAdmin.value && !hotelStore.hotels.length ? hotelStore.fetchAllHotels() : Promise.resolve(),
  ]);
  await load();
});
</script>

<style scoped>
.tile {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  cursor: pointer;
  font-family: inherit;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.tile:hover,
.tile:focus-visible {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.tile-attention {
  border-left: 4px solid var(--p-orange-500);
}
.readings {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1.25rem;
  margin: 0;
}
.readings dt {
  color: var(--p-text-muted-color);
}
.readings dd {
  margin: 0;
}
.break-word {
  word-break: break-word;
}
.simulation {
  border-top: 1px solid var(--p-content-border-color);
}
</style>
