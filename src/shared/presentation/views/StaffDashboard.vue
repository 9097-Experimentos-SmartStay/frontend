<template>
  <div class="p-4 md:p-6 w-full max-w-8xl mx-auto">
    <pv-toast position="bottom-right" />

    <EmailVerificationBanner />
    <PaymentSettingsBanner />

    <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="text-3xl font-bold text-color m-0">{{ t('staffPanel.welcome', { name: user?.firstName || user?.displayName }) }}</h1>
        <p class="text-color-secondary mt-1 mb-0">{{ t('staffPanel.subtitle') }}</p>
      </div>
      <template v-if="createMenuItems.length">
        <pv-button
            :label="t('staffPanel.createNew')"
            icon="pi pi-plus"
            class="p-button-outlined p-button-success"
            aria-haspopup="menu"
            aria-controls="create_menu"
            @click="createMenu.toggle($event)"
        />
        <pv-menu id="create_menu" ref="createMenu" :model="createMenuItems" popup />
      </template>
    </div>

    <!-- Shortcuts: only what the role can do (role matrix, user-role.js) -->
    <div class="grid mb-4">
      <div v-for="item in navItems" :key="item.route" class="col-12 sm:col-6 lg:col-3">
        <button
            type="button"
            class="shortcut surface-card shadow-2 border-round-xl p-3 w-full text-left cursor-pointer border-none"
            @click="router.push({ name: item.route })"
        >
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center bg-primary-50 border-round" style="width: 2.75rem; height: 2.75rem">
              <i :class="[item.icon, 'text-primary text-xl']"></i>
            </div>
            <div>
              <div class="font-bold text-color">{{ item.label }}</div>
              <div class="text-sm text-color-secondary">{{ item.description }}</div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <template v-if="canViewAnalytics">
      <div class="grid mb-4">
        <div class="col-12 md:col-4">
          <div class="surface-card shadow-2 p-3 border-round-xl border-bottom-3 border-blue-500 h-full">
            <span class="block text-500 font-medium mb-3">{{ t('staffPanel.kpi.revenue') }}</span>
            <div class="text-color font-bold text-2xl">
              {{ analyticsStore.loading ? '…' : formatMoney(analyticsStore.metrics?.totalRevenue ?? 0, locale) }}
            </div>
            <span class="text-500 text-sm">{{ t('staffPanel.kpi.currentMonth') }}</span>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-card shadow-2 p-3 border-round-xl border-bottom-3 border-orange-500 h-full">
            <span class="block text-500 font-medium mb-3">{{ t('staffPanel.kpi.occupancy') }}</span>
            <div class="text-color font-bold text-2xl">{{ analyticsStore.loading ? '…' : `${analyticsStore.metrics?.occupancyRate || 0}%` }}</div>
            <span class="text-500 text-sm">{{ t('staffPanel.kpi.bookings', { count: analyticsStore.metrics?.totalBookings || 0 }) }}</span>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-card shadow-2 p-3 border-round-xl border-bottom-3 border-red-500 h-full">
            <span class="block text-500 font-medium mb-3">{{ t('staffPanel.kpi.cancellations') }}</span>
            <div class="text-color font-bold text-2xl">{{ analyticsStore.loading ? '…' : (analyticsStore.metrics?.cancelledBookings || 0) }}</div>
            <span class="text-500 text-sm">{{ t('staffPanel.kpi.currentMonth') }}</span>
          </div>
        </div>
      </div>

      <div class="grid mb-4">
        <div class="col-12 lg:col-8">
          <div class="surface-card shadow-2 border-round-xl p-4 h-full">
            <div class="flex justify-content-between align-items-center mb-4">
              <h2 class="text-xl font-bold text-color m-0">{{ t('staffPanel.financialPerformance') }}</h2>
              <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text p-button-plain" :aria-label="t('common.refresh')" @click="refreshData" />
            </div>
            <div v-if="analyticsStore.loading" class="h-20rem flex align-items-center justify-content-center">
              <pv-progress-spinner />
            </div>
            <template v-else-if="revenueData">
              <pv-chart type="bar" :data="revenueData" :options="barOptions" class="h-20rem" />
              <small class="block mt-2 text-500">{{ t('staffDashboard.revenueHistoryNotAvailable') }}</small>
            </template>
          </div>
        </div>
        <div class="col-12 lg:col-4">
          <div class="surface-card shadow-2 border-round-xl p-4 h-full flex flex-column">
            <h2 class="text-xl font-bold text-color mt-0 mb-4">{{ t('staffPanel.occupancyChart') }}</h2>
            <div class="flex-1 flex align-items-center justify-content-center">
              <pv-progress-spinner v-if="analyticsStore.loading" />
              <pv-chart v-else-if="occupancyData" type="doughnut" :data="occupancyData" :options="pieOptions" class="w-full" style="max-height: 250px;" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import useIamStore from '@/iam/application/iam.store.js';
import { Capability, canRegisterHotel } from '@/iam/domain/user-role.js';
import EmailVerificationBanner from '@/iam/presentation/components/email-verification-banner.vue';
import PaymentSettingsBanner from '@/accommodations/presentation/components/PaymentSettingsBanner.vue';
import { sectionsFor } from '@/shared/presentation/navigation/area-navigation.js';
import { useAnalyticsStore } from '@/analytics/application/analytics.store.js';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';

/**
 * Staff area home for reception, housekeeping, maintenance, admin and chain_admin.
 * Every option depends on the capabilities of the role (user-role.js); analytics only for administrators.
 */
const router = useRouter();
const toast = useToast();
const { t, locale } = useI18n();
const iamStore = useIamStore();
const analyticsStore = useAnalyticsStore();

const createMenu = ref();

const user = computed(() => iamStore.currentUser);
const canViewAnalytics = computed(() => iamStore.can(Capability.VIEW_ANALYTICS));

/** Shortcuts to the sections of the staff area the role can open (same list as the header navigation). */
const navItems = computed(() => sectionsFor(iamStore.area, iamStore.can)
    .map((item) => ({ ...item, label: t(item.labelKey), description: t(item.hintKey) })));

const createMenuItems = computed(() => {
  const items = [];
  if (canRegisterHotel(user.value)) {
    items.push({ label: t('staffPanel.create.hotel'), icon: 'pi pi-building', command: () => router.push({ name: 'create-hotel' }) });
  }
  if (iamStore.can(Capability.MANAGE_ROOMS)) {
    items.push({ label: t('staffPanel.create.room'), icon: 'pi pi-key', command: () => router.push({ name: 'create-room' }) });
  }
  if (iamStore.can(Capability.MANAGE_USERS)) {
    items.push({ label: t('staffPanel.create.user'), icon: 'pi pi-user-plus', command: () => router.push({ name: 'staff-users' }) });
  }
  return items;
});

// --- Charts (current month only: the API has no history) ---
const revenueData = ref(null);
const occupancyData = ref(null);
const barOptions = ref(null);
const pieOptions = ref(null);

function updateCharts() {
  const metrics = analyticsStore.metrics;
  if (!metrics) return;

  const style = getComputedStyle(document.documentElement);
  const textColor = style.getPropertyValue('--p-text-color');
  const textColorSecondary = style.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = style.getPropertyValue('--p-content-border-color');
  const monthLabel = new Date().toLocaleDateString(locale.value, { month: 'long', year: 'numeric' });

  revenueData.value = {
    labels: [monthLabel],
    datasets: [{
      label: t('staffPanel.kpi.revenue'),
      data: [metrics.totalRevenue],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: style.getPropertyValue('--p-primary-color'),
      borderWidth: 1,
      maxBarThickness: 80,
    }],
  };
  barOptions.value = {
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
      y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder }, beginAtZero: true },
    },
  };

  const occupancy = metrics.occupancyRate || 0;
  occupancyData.value = {
    labels: [t('staffPanel.occupied'), t('staffPanel.available')],
    datasets: [{
      data: [occupancy, 100 - occupancy],
      backgroundColor: [style.getPropertyValue('--p-green-500'), style.getPropertyValue('--p-surface-300')],
      borderWidth: 0,
    }],
  };
  pieOptions.value = { plugins: { legend: { labels: { color: textColor }, position: 'bottom' } }, cutout: '60%' };
}

async function refreshData() {
  await analyticsStore.fetchMonthlyMetrics();
  updateCharts();
  toast.add({ severity: 'success', summary: t('common.updated'), life: 2000 });
}

onMounted(async () => {
  // GET /analytics is admin/chain_admin only: other roles would get 403.
  if (canViewAnalytics.value) {
    await analyticsStore.fetchMonthlyMetrics();
    updateCharts();
  }
});

watch(() => analyticsStore.metrics, updateCharts);
watch(locale, updateCharts);
</script>

<style scoped>
.shortcut {
  font-family: inherit;
  transition: box-shadow 0.2s;
}

.shortcut:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

:deep(.p-chart) {
  position: relative;
  width: 100%;
}
</style>
