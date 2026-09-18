<template>
  <div class="booking-calendar" :class="`view-${view}`">
    <div class="weekdays" aria-hidden="true">
      <span v-for="name in weekdayNames" :key="name">{{ name }}</span>
    </div>

    <div class="days" role="grid" :aria-busy="loading">
      <div
          v-for="date in dates"
          :key="date.toIsoString()"
          role="gridcell"
          class="day"
          :class="{ outside: view === 'month' && date.month !== month, today: date.equals(today) }"
      >
        <div class="day-header">
          <span class="day-number">{{ date.day }}</span>
          <span v-if="dayOf(date)" class="day-stats" :title="t('calendar.statsTitle')">
            <span v-if="dayOf(date).arrivals.length" class="stat arrival"><i class="pi pi-sign-in"></i>{{ dayOf(date).arrivals.length }}</span>
            <span v-if="dayOf(date).departures.length" class="stat departure"><i class="pi pi-sign-out"></i>{{ dayOf(date).departures.length }}</span>
            <span v-if="dayOf(date).occupiedRooms" class="stat occupied"><i class="pi pi-home"></i>{{ dayOf(date).occupiedRooms }}</span>
          </span>
        </div>

        <button
            v-for="booking in visibleBookings(date)"
            :key="booking.id"
            type="button"
            class="chip"
            :class="`status-${booking.status}`"
            :title="chipTitle(booking)"
            @click="emit('select', booking)"
        >
          <i v-if="dayOf(date)?.isArrival(booking.id)" class="pi pi-sign-in" :aria-label="t('calendar.arrival')"></i>
          <i v-else-if="dayOf(date)?.isDeparture(booking.id)" class="pi pi-sign-out" :aria-label="t('calendar.departure')"></i>
          <span class="chip-room">{{ booking.roomLabel }}</span>
          <span class="chip-guest">{{ booking.guestName }}</span>
          <span v-if="view === 'week'" class="chip-extra">{{ booking.reference }} · {{ formatMoney(booking.total, locale) }}</span>
        </button>
        <span v-if="hiddenCount(date) > 0" class="more">{{ t('calendar.more', { count: hiddenCount(date) }) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';
import { bookingStatusLabel } from '../utils/booking-status.js';

/**
 * Month / week grid of the reservations calendar (US-07 scenario 1), built with CSS grid over the data of
 * GET /bookings/calendar: the API already groups arrivals, departures and guests in house per day, so no
 * calendar library is needed (FullCalendar or similar would add ~100 kB and its own styles for a read-only grid).
 * Each booking is a chip colored by status (Pending = awaiting payment) with the room number and the guest.
 */
const props = defineProps({
  /** @type {import('../../domain/model/booking-calendar.js').BookingCalendar|null} */
  calendar: { type: Object, default: null },
  /** First and last (excluded) day of the grid. */
  from: { type: Object, required: true },
  to: { type: Object, required: true },
  /** Month shown (1–12), to dim the days of the neighbour months. */
  month: { type: Number, required: true },
  view: { type: String, default: 'month' },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['select']);
const { t, locale } = useI18n();

const MONTH_CHIPS = 3;
const today = CalendarDate.today();
const dates = computed(() => props.from.daysUntilExclusive(props.to));
const weekdayNames = computed(() => {
  const monday = today.startOfWeek();
  return Array.from({ length: 7 }, (_, i) => monday.addDays(i).format(locale.value, { weekday: 'short' }));
});

const dayOf = (date) => props.calendar?.dayOf(date) ?? null;
const bookingsOn = (date) => props.calendar?.bookingsOn(date) ?? [];
const visibleBookings = (date) => (props.view === 'week' ? bookingsOn(date) : bookingsOn(date).slice(0, MONTH_CHIPS));
const hiddenCount = (date) => (props.view === 'week' ? 0 : Math.max(0, bookingsOn(date).length - MONTH_CHIPS));
const chipTitle = (booking) => `${booking.reference} · ${booking.guestName} · ${t('staffBookings.room')} ${booking.roomLabel} · ${bookingStatusLabel(t, booking.status)}`;
</script>

<style scoped>
.booking-calendar {
  width: 100%;
  overflow-x: auto;
}
.weekdays,
.days {
  display: grid;
  grid-template-columns: repeat(7, minmax(7.5rem, 1fr));
  min-width: 52rem;
}
.weekdays span {
  padding: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  color: #64748b;
}
.day {
  border: 1px solid #e2e8f0;
  margin: -1px 0 0 -1px;
  min-height: 7.5rem;
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: #fff;
}
.view-week .day {
  min-height: 18rem;
}
.day.outside {
  background: #f8fafc;
}
.day.outside .day-number {
  color: #94a3b8;
}
.day.today .day-number {
  background: #2563eb;
  color: #fff;
  border-radius: 999px;
  padding: 0 0.45rem;
}
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.day-number {
  font-weight: 700;
  font-size: 0.9rem;
}
.day-stats {
  display: flex;
  gap: 0.35rem;
  font-size: 0.7rem;
}
.stat {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
}
.stat .pi {
  font-size: 0.65rem;
}
.stat.arrival { color: #15803d; }
.stat.departure { color: #b91c1c; }
.stat.occupied { color: #475569; }
.chip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  border: 0;
  border-left: 4px solid;
  border-radius: 4px;
  padding: 0.2rem 0.35rem;
  font: inherit;
  font-size: 0.75rem;
  text-align: left;
  cursor: pointer;
}
.chip:hover,
.chip:focus-visible {
  filter: brightness(0.95);
  outline: 2px solid #93c5fd;
}
.chip .pi {
  font-size: 0.7rem;
}
.chip-room {
  font-weight: 700;
}
.chip-guest {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.chip-extra {
  width: 100%;
  color: #475569;
}
.status-Pending {
  background: #fef3c7;
  border-color: #d97706;
  color: #78350f;
}
.status-Confirmed {
  background: #dcfce7;
  border-color: #16a34a;
  color: #14532d;
}
.status-CheckedIn {
  background: #dbeafe;
  border-color: #2563eb;
  color: #1e3a8a;
}
.more {
  font-size: 0.7rem;
  color: #64748b;
}
</style>
