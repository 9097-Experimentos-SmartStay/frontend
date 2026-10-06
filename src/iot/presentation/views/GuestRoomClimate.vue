<template>
  <div class="p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-5xl mx-auto">
      <div class="flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div class="flex align-items-center gap-3">
          <pv-button
              icon="pi pi-arrow-left"
              :label="t('common.back')"
              class="p-button-outlined p-button-sm"
              @click="router.push({ name: 'guest-dashboard' })"
          />
          <div>
            <h1 class="text-3xl font-bold text-color m-0">{{ t('climate.guest.title') }}</h1>
            <p class="text-color-secondary m-0 mt-1">{{ t('climate.guest.subtitle') }}</p>
          </div>
        </div>
        <pv-button
            v-if="selectedBooking"
            icon="pi pi-refresh"
            class="p-button-rounded p-button-text"
            :aria-label="t('common.refresh')"
            v-tooltip="t('common.refresh')"
            :loading="climateStore.loading"
            @click="loadClimate({ force: true })"
        />
      </div>

      <!-- The emulator is not part of this API: say so once, instead of an error per action. -->
      <pv-message v-if="climateStore.unavailable" severity="info" :closable="false" class="mb-4">
        {{ t('climate.unavailable') }}
      </pv-message>

      <div v-if="bookingStore.loading && !stayBookings.length" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <!-- Nothing to control: the climate belongs to a room the guest has booked -->
      <div v-else-if="!stayBookings.length" class="surface-card shadow-1 border-round-xl p-6 text-center">
        <i class="pi pi-sliders-h text-4xl text-color-secondary mb-3 block"></i>
        <h2 class="text-xl font-semibold text-color mt-0 mb-2">{{ t('climate.guest.noStayTitle') }}</h2>
        <p class="text-color-secondary mb-4">{{ t('climate.guest.noStayMessage') }}</p>
        <pv-button
            :label="t('guestBookings.newBooking')"
            icon="pi pi-plus"
            @click="router.push({ name: 'guest-create-booking' })"
        />
      </div>

      <template v-else>
        <!-- More than one stay: the guest picks which room they are setting -->
        <div v-if="stayBookings.length > 1" class="surface-card shadow-1 border-round-xl p-3 mb-4">
          <label for="stay" class="block mb-2 font-medium">{{ t('climate.guest.chooseStay') }}</label>
          <pv-select
              id="stay"
              v-model="selectedBookingId"
              :options="stayOptions"
              option-label="label"
              option-value="value"
              class="w-full md:w-30rem"
          />
        </div>

        <div class="grid">
          <!-- Current board -->
          <div class="col-12 lg:col-7">
            <div class="surface-card shadow-2 border-round-xl p-4 h-full">
              <div class="flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <span class="block text-500 font-medium">{{ t('climate.guest.roomLabel', { room: selectedBooking.roomLabel }) }}</span>
                  <span class="text-sm text-color-secondary">{{ selectedBooking.reference }}</span>
                </div>
                <pv-tag
                    v-if="climate"
                    :severity="comfortStyle(climate.comfort).severity"
                    :icon="comfortStyle(climate.comfort).icon"
                    :value="comfortLabel(t, climate.comfort)"
                    rounded
                />
              </div>

              <div v-if="climateStore.loading && !climate" class="flex justify-content-center p-5">
                <pv-progress-spinner style="width: 3rem; height: 3rem" />
              </div>

              <template v-else-if="climate">
                <div class="text-6xl font-bold text-color mb-1">{{ formatCelsius(climate.temperature, locale) }}</div>
                <p class="text-color-secondary mt-0 mb-4">
                  {{ t('climate.comfortRange', { min: COMFORT_RANGE.min, max: COMFORT_RANGE.max }) }}
                </p>

                <dl class="readings">
                  <dt>{{ t('climate.fields.motion') }}</dt>
                  <dd>
                    <pv-tag
                        :severity="climate.motionDetected ? 'success' : 'secondary'"
                        :value="climate.motionDetected ? t('climate.motion.detected') : t('climate.motion.none')"
                        rounded
                    />
                  </dd>

                  <dt>{{ t('climate.fields.hardware') }}</dt>
                  <dd>
                    <pv-tag
                        :severity="climate.isHardwareAltered ? 'warn' : 'success'"
                        :value="climate.isHardwareAltered ? t('climate.hardware.altered') : t('climate.hardware.healthy')"
                        rounded
                    />
                  </dd>

                  <dt>{{ t('climate.fields.device') }}</dt>
                  <dd class="text-sm">{{ climate.device || '—' }}</dd>

                  <dt>{{ t('climate.fields.updatedAt') }}</dt>
                  <dd class="text-sm">{{ formatDateTime(climate.measuredAt, locale) }}</dd>
                </dl>

                <pv-message v-if="climate.isPowerSaving" severity="info" :closable="false" class="mt-3">
                  {{ t('climate.powerSaving') }}
                </pv-message>
              </template>

              <pv-message v-else-if="failureText" severity="error" :closable="false">{{ failureText }}</pv-message>
            </div>
          </div>

          <!-- Thermostat -->
          <div class="col-12 lg:col-5">
            <div class="surface-card shadow-2 border-round-xl p-4 h-full">
              <h2 class="text-xl font-semibold text-color mt-0 mb-1">{{ t('climate.thermostat.title') }}</h2>
              <p class="text-color-secondary mt-0 mb-4">{{ t('climate.thermostat.subtitle') }}</p>
              <ThermostatControl
                  :room-id="selectedBooking.roomId"
                  :current-temperature="climate?.temperature ?? null"
                  :saving="climateStore.saving"
                  :disabled="climateStore.unavailable"
                  @submit="applyThermostat"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import ThermostatControl from '../components/ThermostatControl.vue';
import useClimateStore from '../../application/climate.store.js';
import { COMFORT_RANGE } from '../../domain/model/room-climate.js';
import { comfortLabel, comfortStyle, formatCelsius } from '../utils/climate-style.js';
import { useBookingStore } from '@/bookings/application/booking.store.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';
import { formatDateTime } from '@/shared/presentation/utils/formatters.js';
import { IotFailureReason } from '../../application/iot-failure.js';

/**
 * US-11: the guest sets the temperature and fan speed of the room they are staying in, and sees what
 * the room's board reports back (temperature, presence, hardware).
 *
 * The climate belongs to a room, and a guest reaches a room through a booking, so the view works off
 * the guest's active stays. With several stays they pick one.
 */
const router = useRouter();
const toast = useToast();
const { t, locale } = useI18n();
const bookingStore = useBookingStore();
const climateStore = useClimateStore();

const selectedBookingId = ref(null);

/** Stays that give access to a room today: Confirmed or CheckedIn, with tonight among its nights (R5). */
const stayBookings = computed(() => bookingStore.bookings.filter((booking) => booking.isStayInEffect()));

const stayOptions = computed(() => stayBookings.value.map((booking) => ({
  value: booking.id,
  label: t('climate.guest.stayOption', { room: booking.roomLabel, code: booking.reference }),
})));

const selectedBooking = computed(
    () => stayBookings.value.find((booking) => booking.id === selectedBookingId.value) ?? stayBookings.value[0] ?? null
);

const climate = computed(() => (selectedBooking.value ? climateStore.climateFor(selectedBooking.value.roomId) : null));

const failureText = computed(() => {
  const failure = climateStore.error;
  if (!failure || failure.reason === IotFailureReason.EMULATOR_NOT_AVAILABLE) return '';
  return t(failureMessageKey(failure));
});

/** Room whose board is already on screen, so mounting and switching stays never ask twice. */
const loadedRoomId = ref(null);

async function loadClimate({ force = false } = {}) {
  const roomId = selectedBooking.value?.roomId;
  if (roomId == null) return;
  if (!force && loadedRoomId.value === roomId) return;
  loadedRoomId.value = roomId;
  try {
    await climateStore.fetchClimate(roomId);
  } catch {
    // Already in climateStore.error; the unavailable case has its own notice.
  }
}

async function applyThermostat(command) {
  try {
    await climateStore.setThermostat(selectedBooking.value.roomId, command);
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('climate.thermostat.applied', { temperature: formatCelsius(command.targetTemperature, locale.value) }),
      life: 4000,
    });
  } catch (failure) {
    const key = failure?.reason === IotFailureReason.EMULATOR_NOT_AVAILABLE
        ? 'climate.unavailable'
        : failureMessageKey(failure);
    toast.add({ severity: 'error', summary: t('common.error'), detail: t(key), life: 5000 });
  }
}

// Changing the selected stay reads the board of the new room (`loadClimate` ignores a repeat).
watch(selectedBooking, () => loadClimate());

onMounted(async () => {
  if (!bookingStore.bookings.length) await bookingStore.fetchBookings();
  selectedBookingId.value = stayBookings.value[0]?.id ?? null;
  await loadClimate();
});
</script>

<style scoped>
.readings {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem 1.25rem;
  margin: 0;
  align-items: center;
}
.readings dt {
  color: var(--p-text-muted-color);
}
.readings dd {
  margin: 0;
}
</style>
