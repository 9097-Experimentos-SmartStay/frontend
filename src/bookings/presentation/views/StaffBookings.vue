<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog />

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex flex-wrap gap-3 justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" :aria-label="t('common.back')" @click="router.push({ name: 'staff-dashboard' })" />
        <div>
          <h1 class="text-2xl font-bold text-color m-0">{{ t('staffBookings.title') }}</h1>
          <p class="text-color-secondary m-0">{{ t('staffBookings.subtitle') }}</p>
        </div>
      </div>
      <div class="flex flex-wrap align-items-center gap-2">
        <pv-select
            v-if="isChainAdmin"
            v-model="hotelFilter"
            :options="hotelOptions"
            option-label="name"
            option-value="id"
            class="w-full md:w-15rem"
            @change="reloadCalendar"
        />
        <pv-select-button v-if="canSeeCalendar" v-model="mode" :options="modeOptions" option-label="label" option-value="value" :allow-empty="false" />
        <pv-button v-if="canManage && (isChainAdmin || ownHotelId)" :label="t('manualBooking.open')" icon="pi pi-plus" @click="manualDialog = true" />
      </div>
    </div>

    <!-- US-07 scenario 1: calendar organized by date -->
    <section v-if="mode === 'calendar'" class="surface-card p-3 md:p-4 shadow-2 border-round">
      <div class="flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div class="flex align-items-center gap-2">
          <pv-button icon="pi pi-chevron-left" class="p-button-text p-button-rounded" :aria-label="t('calendar.previous')" @click="move(-1)" />
          <pv-button :label="t('calendar.today')" class="p-button-outlined p-button-sm" @click="goToday" />
          <pv-button icon="pi pi-chevron-right" class="p-button-text p-button-rounded" :aria-label="t('calendar.next')" @click="move(1)" />
          <h2 class="text-xl font-semibold m-0 ml-2 capitalize">{{ periodLabel }}</h2>
        </div>
        <pv-select-button v-model="calendarView" :options="calendarViewOptions" option-label="label" option-value="value" :allow-empty="false" @change="reloadCalendar" />
      </div>

      <div class="flex flex-wrap gap-3 mb-3 text-sm">
        <span v-for="status in LEGEND" :key="status" class="legend"><span class="swatch" :class="`status-${status}`"></span>{{ bookingStatusLabel(t, status) }}</span>
        <span class="legend"><i class="pi pi-sign-in text-green-700"></i>{{ t('calendar.arrival') }}</span>
        <span class="legend"><i class="pi pi-sign-out text-red-700"></i>{{ t('calendar.departure') }}</span>
        <span class="legend"><i class="pi pi-home"></i>{{ t('calendar.occupied') }}</span>
      </div>

      <pv-message v-if="calendarError" severity="warn" class="mb-3">{{ calendarError }}</pv-message>
      <BookingCalendar
          :calendar="bookingStore.calendar"
          :from="period.from"
          :to="period.to"
          :month="anchor.month"
          :view="calendarView"
          :loading="bookingStore.loadingCalendar"
          @select="openDetail"
      />
    </section>

    <!-- List of every booking visible to the role (newest first) -->
    <section v-else class="surface-card p-3 md:p-4 shadow-2 border-round">
      <div class="flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <pv-icon-field>
          <pv-input-icon class="pi pi-search" />
          <pv-input-text v-model="search" :placeholder="t('staffBookings.search')" class="w-full md:w-20rem" />
        </pv-icon-field>
        <div class="flex gap-2">
          <pv-select v-model="statusFilter" :options="statusOptions" option-label="label" option-value="value" class="w-full md:w-14rem" />
          <pv-button icon="pi pi-refresh" class="p-button-outlined" :aria-label="t('common.refresh')" v-tooltip="t('common.refresh')" :loading="bookingStore.loading" @click="bookingStore.fetchBookings" />
        </div>
      </div>

      <pv-data-table :value="filteredBookings" :loading="bookingStore.loading" data-key="id" paginator :rows="10" responsive-layout="scroll" class="p-datatable-sm">
        <template #empty>{{ t('staffBookings.empty') }}</template>
        <pv-column field="reference" :header="t('guestPayment.bookingCode')" sortable>
          <template #body="{ data }"><a href="#" class="font-semibold text-primary no-underline" @click.prevent="openDetail(data)">{{ data.reference }}</a></template>
        </pv-column>
        <pv-column :header="t('staffBookings.guest')">
          <template #body="{ data }">
            <div class="flex flex-column">
              <span class="font-medium">{{ data.guestName }}</span>
              <span class="text-sm text-color-secondary">{{ data.guestEmail }}</span>
            </div>
          </template>
        </pv-column>
        <pv-column field="roomNumber" :header="t('staffBookings.room')" sortable>
          <template #body="{ data }"><span class="font-medium">{{ data.roomLabel }}</span></template>
        </pv-column>
        <pv-column :header="t('staffBookings.dates')">
          <template #body="{ data }">
            <div class="text-sm">
              <div>{{ formatDay(data.checkInDate, locale) }} → {{ formatDay(data.checkOutDate, locale) }}</div>
              <div class="text-color-secondary">{{ t('stay.nights', { count: data.nights }, data.nights) }}</div>
            </div>
          </template>
        </pv-column>
        <pv-column :header="t('guestSearch.total')">
          <template #body="{ data }">{{ formatMoney(data.total, locale) }}</template>
        </pv-column>
        <pv-column :header="t('staffBookings.status')">
          <template #body="{ data }">
            <BookingStatusTag :booking="data" />
            <small v-if="data.isPending() && data.paymentDueAt" class="block text-color-secondary mt-1">{{ t('paymentDeadline.payBefore', { time: formatDateTime(data.paymentDueAt, locale) }) }}</small>
          </template>
        </pv-column>
        <pv-column :header="t('common.actions')" style="width: 11rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <pv-button v-if="canRegisterPayments && data.canBePaid()" icon="pi pi-wallet" class="p-button-rounded p-button-text p-button-success" v-tooltip.top="t('registerPayment.action')" :aria-label="t('registerPayment.action')" @click="openRegisterPayment(data)" />
              <pv-button v-if="canManage && data.canBeChanged()" icon="pi pi-pencil" class="p-button-rounded p-button-text" v-tooltip.top="t('staffBookings.change')" :aria-label="t('staffBookings.change')" @click="openChange(data)" />
              <pv-button
                  v-if="canCancel && (data.isPending() || data.isConfirmed())"
                  icon="pi pi-times"
                  class="p-button-rounded p-button-text p-button-danger"
                  v-tooltip.top="data.canBeCancelled() ? t('staffBookings.cancel') : cancellationBlockText(t, data, locale)"
                  :aria-label="t('staffBookings.cancel')"
                  :disabled="!data.canBeCancelled()"
                  @click="cancel(data)"
              />
              <pv-button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-info" v-tooltip.top="t('staffBookings.view')" :aria-label="t('staffBookings.view')" @click="openDetail(data)" />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </section>

    <StaffBookingDetailDialog
        v-model:visible="detail.visible"
        :booking="detail.booking"
        :can-register-payments="canRegisterPayments"
        :can-manage="canManage"
        :can-cancel="canCancel"
        @register-payment="openRegisterPayment"
        @change="openChange"
        @cancel="cancel"
    />
    <ManualBookingDialog v-model:visible="manualDialog" :fixed-hotel-id="ownHotelId" :hotels="hotelStore.hotels" @created="onCreated" />
    <ChangeBookingDialog v-model:visible="change.visible" :booking="change.booking" @changed="onChanged" />
    <RegisterPaymentDialog v-model:visible="payment.visible" :booking="payment.booking" @registered="onPaymentRegistered" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useBookingStore } from '../../application/booking.store.js';
import { BookingStatus } from '../../domain/model/booking-status.js';
import BookingCalendar from '../components/BookingCalendar.vue';
import BookingStatusTag from '../components/BookingStatusTag.vue';
import StaffBookingDetailDialog from '../components/StaffBookingDetailDialog.vue';
import ManualBookingDialog from '../components/ManualBookingDialog.vue';
import ChangeBookingDialog from '../components/ChangeBookingDialog.vue';
import { useBookingCancellation } from '../composables/use-booking-cancellation.js';
import { bookingStatusLabel, cancellationBlockText } from '../utils/booking-status.js';
import RegisterPaymentDialog from '@/payments/presentation/components/RegisterPaymentDialog.vue';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import useIamStore from '@/iam/application/iam.store.js';
import { Capability, UserRole } from '@/iam/domain/user-role.js';
import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { formatDateTime, formatDay, formatMoney } from '@/shared/presentation/utils/formatters.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/**
 * US-07: centralized reservations of the hotel. Calendar (month/week) and list; manual booking for phone or
 * walk-in guests; change dates/room; cancel with the policy; register the payment that confirms a booking.
 * Reception and admin work on their hotel; a chain_admin on any (or all). Housekeeping and maintenance only read.
 */
const router = useRouter();
const { t, locale } = useI18n();
const toast = useToast();
const bookingStore = useBookingStore();
const hotelStore = useHotelStore();
const iamStore = useIamStore();
const { confirmCancel } = useBookingCancellation();

const LEGEND = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN];
const EXPIRED = 'Expired';

const isChainAdmin = computed(() => iamStore.role === UserRole.CHAIN_ADMIN);
const canSeeCalendar = computed(() => iamStore.can(Capability.VIEW_BOOKING_CALENDAR));
const canManage = computed(() => iamStore.can(Capability.MANAGE_BOOKINGS));
const canCancel = computed(() => iamStore.can(Capability.CANCEL_BOOKINGS));
const canRegisterPayments = computed(() => iamStore.can(Capability.REGISTER_PAYMENTS));
const ownHotelId = computed(() => (isChainAdmin.value ? null : iamStore.currentUser?.hotelId ?? null));

const mode = ref(canSeeCalendar.value ? 'calendar' : 'list');
const modeOptions = computed(() => [
  { value: 'calendar', label: t('staffBookings.calendarMode') },
  { value: 'list', label: t('staffBookings.listMode') },
]);
const calendarView = ref('month');
const calendarViewOptions = computed(() => [
  { value: 'month', label: t('calendar.month') },
  { value: 'week', label: t('calendar.week') },
]);
const anchor = ref(CalendarDate.today());
const hotelFilter = ref(null);
const hotelOptions = computed(() => [{ id: null, name: t('staffBookings.allHotels') }, ...hotelStore.hotels]);
const search = ref('');
const statusFilter = ref(null);
const statusOptions = computed(() => [
  { value: null, label: t('staffBookings.allStatuses') },
  ...[BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CANCELLED].map((value) => ({ value, label: bookingStatusLabel(t, value) })),
  { value: EXPIRED, label: t('bookingStatus.Expired') },
]);
const calendarError = ref('');

const detail = reactive({ visible: false, booking: null });
const change = reactive({ visible: false, booking: null });
const payment = reactive({ visible: false, booking: null });
const manualDialog = ref(false);

/** Month view: 6 full weeks from the Monday before the 1st (42 days ≤ 92). Week view: Monday to Sunday. */
const period = computed(() => {
  if (calendarView.value === 'week') {
    const from = anchor.value.startOfWeek();
    return { from, to: from.addDays(7) };
  }
  const from = anchor.value.startOfMonth().startOfWeek();
  return { from, to: from.addDays(42) };
});
const periodLabel = computed(() => (calendarView.value === 'week'
  ? `${formatDay(period.value.from, locale.value)} – ${formatDay(period.value.to.addDays(-1), locale.value)}`
  : anchor.value.format(locale.value, { month: 'long', year: 'numeric' })));

const filteredBookings = computed(() => {
  const text = search.value.trim().toLowerCase();
  return bookingStore.bookings.filter((booking) => {
    if (hotelFilter.value && booking.hotelId !== hotelFilter.value) return false;
    if (statusFilter.value === EXPIRED && !booking.isExpired) return false;
    if (statusFilter.value && statusFilter.value !== EXPIRED && booking.status !== statusFilter.value) return false;
    if (!text) return true;
    return `${booking.reference} ${booking.guestName} ${booking.guestEmail} ${booking.roomLabel}`.toLowerCase().includes(text);
  });
});

async function reloadCalendar() {
  if (!canSeeCalendar.value) return;
  calendarError.value = '';
  try {
    await bookingStore.fetchCalendar({ ...period.value, hotelId: isChainAdmin.value ? hotelFilter.value : null });
  } catch (failure) {
    calendarError.value = t(failureMessageKey(failure, { forbidden: 'staffBookings.noHotel' }));
  }
}

function move(step) {
  anchor.value = calendarView.value === 'week' ? anchor.value.addDays(7 * step) : anchor.value.addMonths(step);
  reloadCalendar();
}

function goToday() {
  anchor.value = CalendarDate.today();
  reloadCalendar();
}

/** Calendar entries carry the key facts only: the full booking (payment, contact, reason) is read on open. */
async function openDetail(booking) {
  const full = bookingStore.bookings.find((item) => item.id === booking.id) ?? await bookingStore.fetchBookingById(booking.id);
  Object.assign(detail, { visible: true, booking: full ?? booking });
}

function openChange(booking) {
  detail.visible = false;
  Object.assign(change, { visible: true, booking });
}

function openRegisterPayment(booking) {
  detail.visible = false;
  Object.assign(payment, { visible: true, booking });
}

function cancel(booking) {
  detail.visible = false;
  confirmCancel(booking, reloadCalendar);
}

async function onCreated(booking) {
  toast.add({ severity: 'success', summary: t('common.success'), detail: t('manualBooking.created', { code: booking.reference }), life: 5000 });
  await reloadCalendar();
}

async function onChanged(booking) {
  toast.add({ severity: 'success', summary: t('common.success'), detail: t('changeBooking.done', { code: booking.reference }), life: 5000 });
  await reloadCalendar();
}

async function onPaymentRegistered() {
  toast.add({ severity: 'success', summary: t('common.success'), detail: t('registerPayment.success', { code: payment.booking?.reference ?? '' }), life: 5000 });
  if (payment.booking) await bookingStore.refreshBooking(payment.booking.id);
  await reloadCalendar();
}

onMounted(async () => {
  await Promise.all([
    bookingStore.fetchBookings(),
    isChainAdmin.value ? hotelStore.fetchAllHotels() : Promise.resolve(),
    reloadCalendar(),
  ]);
});
</script>

<style scoped>
.legend {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.swatch {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 3px;
  border-left: 4px solid;
}
.status-Pending { background: #fef3c7; border-color: #d97706; }
.status-Confirmed { background: #dcfce7; border-color: #16a34a; }
.status-CheckedIn { background: #dbeafe; border-color: #2563eb; }
</style>
