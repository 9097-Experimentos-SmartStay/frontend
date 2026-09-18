<template>
  <div class="p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex align-items-center gap-3">
      <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" :aria-label="t('common.back')" @click="goBack" />
      <div>
        <h1 class="text-2xl font-bold text-color m-0">{{ t('audit.title') }}</h1>
        <p class="text-color-secondary m-0">{{ isChainAdmin ? t('audit.subtitle') : t('audit.subtitleAdmin') }}</p>
      </div>
    </div>

    <form class="surface-card p-4 shadow-2 border-round mb-4 grid formgrid p-fluid align-items-end" @submit.prevent="applyFilters">
      <div class="col-12 md:col-3 field">
        <label for="f-user" class="font-medium">{{ t('audit.filters.user') }}</label>
        <pv-select
            v-model="filters.userId"
            input-id="f-user"
            :options="userOptions"
            option-label="label"
            option-value="value"
            filter
            show-clear
            :placeholder="t('audit.filters.userPlaceholder')"
        />
      </div>
      <div class="col-12 md:col-3 field">
        <label for="f-action" class="font-medium">{{ t('audit.filters.action') }}</label>
        <pv-select
            v-model="filters.action"
            input-id="f-action"
            :options="actionOptions"
            option-label="label"
            option-value="value"
            show-clear
            :placeholder="t('audit.filters.actionPlaceholder')"
        />
      </div>
      <div class="col-6 md:col-2 field">
        <label for="f-from" class="font-medium">{{ t('audit.filters.from') }}</label>
        <pv-input-text id="f-from" v-model="filters.from" type="date" :invalid="rangeInvalid" />
      </div>
      <div class="col-6 md:col-2 field">
        <label for="f-to" class="font-medium">{{ t('audit.filters.to') }}</label>
        <pv-input-text id="f-to" v-model="filters.to" type="date" :min="filters.from || undefined" :invalid="rangeInvalid" />
      </div>
      <div class="col-12 md:col-2 field flex gap-2">
        <pv-button type="submit" :label="t('audit.filters.apply')" icon="pi pi-filter" />
        <pv-button type="button" icon="pi pi-times" class="p-button-outlined p-button-secondary" :aria-label="t('audit.filters.clear')" v-tooltip.top="t('audit.filters.clear')" @click="clearFilters" />
      </div>
      <small v-if="rangeInvalid" class="col-12 p-error">{{ t('validation.dateRange') }}</small>
    </form>

    <div class="surface-card p-4 shadow-2 border-round">
      <pv-data-table
          :value="store.auditLog.items"
          :loading="store.loadingAuditLog"
          lazy
          paginator
          :rows="store.auditLog.pageSize"
          :first="(store.auditLog.page - 1) * store.auditLog.pageSize"
          :total-records="store.auditLog.totalCount"
          :rows-per-page-options="[20, 50, 100]"
          data-key="id"
          responsive-layout="scroll"
          class="p-datatable-sm"
          @page="onPage"
      >
        <template #header>
          <span class="text-color-secondary">{{ t('audit.total', { count: store.auditLog.totalCount }) }}</span>
        </template>
        <template #empty>{{ t('audit.empty') }}</template>

        <pv-column :header="t('audit.columns.date')">
          <template #body="{ data }">{{ data.occurredAt.toLocaleDateString(locale) }}</template>
        </pv-column>
        <pv-column :header="t('audit.columns.time')">
          <template #body="{ data }">{{ data.occurredAt.toLocaleTimeString(locale) }}</template>
        </pv-column>
        <pv-column :header="t('audit.columns.user')">
          <template #body="{ data }">
            <div class="flex flex-column">
              <span class="font-medium">{{ data.actorEmail ?? t('audit.unknownUser') }}</span>
              <span v-if="data.targetEmail && data.targetEmail !== data.actorEmail" class="text-sm text-color-secondary">
                {{ t('audit.onUser', { email: data.targetEmail }) }}
              </span>
            </div>
          </template>
        </pv-column>
        <pv-column :header="t('audit.columns.action')">
          <template #body="{ data }">{{ actionLabel(data.action) }}</template>
        </pv-column>
        <pv-column :header="t('audit.columns.outcome')">
          <template #body="{ data }">
            <pv-tag :value="t(`audit.outcome.${data.outcome}`)" :severity="data.failed ? 'danger' : 'success'" rounded />
          </template>
        </pv-column>
        <pv-column field="details" :header="t('audit.columns.details')">
          <template #body="{ data }"><span class="text-sm">{{ detailsLabel(data.details) }}</span></template>
        </pv-column>
        <pv-column field="ipAddress" :header="t('audit.columns.ip')">
          <template #body="{ data }"><span class="text-sm text-color-secondary">{{ data.ipAddress ?? '—' }}</span></template>
        </pv-column>
      </pv-data-table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useIamStore from '../../application/iam.store.js';
import { useUserManagementStore } from '../../application/user-management.store.js';
import { AuditLogQuery } from '../../domain/commands/audit-log.query.js';
import { AuditAction } from '../../domain/model/audit-log-entry.entity.js';
import { Capability, UserRole } from '../../domain/user-role.js';
import { CalendarDate } from '@/shared/domain/calendar-date.js';

/**
 * US-03 scenario 4: access audit with date, time, user and action, filtered and paginated by the API.
 */
const { t, te, locale } = useI18n();
const router = useRouter();
const toast = useToast();
const iamStore = useIamStore();
const store = useUserManagementStore();

const filters = reactive({ userId: null, action: null, from: '', to: '' });

const isChainAdmin = computed(() => iamStore.role === UserRole.CHAIN_ADMIN);
const rangeInvalid = computed(() => {
  const from = CalendarDate.from(filters.from);
  const to = CalendarDate.from(filters.to);
  return !!(from && to && to.isBefore(from));
});
const userOptions = computed(() => store.users.map((user) => ({ value: user.id, label: `${user.displayName} (${user.email})` })));
const actionOptions = computed(() => Object.values(AuditAction).map((action) => ({ value: action, label: actionLabel(action) })));

const actionLabel = (action) => t(`audit.actions.${action}`);
const roleLabel = (role) => (te(`roles.${role}`) ? t(`roles.${role}`) : role);

/** @param {number|null} id */
const scopeLabel = (id) => (id == null ? t('audit.details.none') : `#${id}`);

/** @param {import('../../domain/model/audit-details.js').AuditDetails|null} details */
function detailsLabel(details) {
  if (!details) return '—';
  const parts = [];
  if (details.isRoleChange) parts.push(t('audit.details.roleChange', { from: roleLabel(details.previousRole), to: roleLabel(details.newRole) }));
  else if (details.role) parts.push(t('audit.details.role', { role: roleLabel(details.role) }));
  if (details.method && te(`audit.details.method.${details.method}`)) parts.push(t(`audit.details.method.${details.method}`));
  if (details.reason && te(`audit.details.reason.${details.reason}`)) parts.push(t(`audit.details.reason.${details.reason}`));
  if (details.lockedUntil) parts.push(t('audit.details.lockedUntil', { time: details.lockedUntil.toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' }) }));
  if (details.isHotelChange) parts.push(t('audit.details.hotelChange', { from: scopeLabel(details.previousHotelId), to: scopeLabel(details.newHotelId) }));
  if (details.isChainChange) parts.push(t('audit.details.chainChange', { from: scopeLabel(details.previousChainId), to: scopeLabel(details.newChainId) }));
  if (details.remainingRecoveryCodes != null) {
    parts.push(t('audit.details.remainingCodes', { count: details.remainingRecoveryCodes }, details.remainingRecoveryCodes));
  }
  return parts.length ? parts.join(' · ') : '—';
}

function goBack() {
  router.push(iamStore.can(Capability.MANAGE_USERS) ? { name: 'staff-users' } : { name: 'staff-dashboard' });
}

async function load(query) {
  try {
    await store.fetchAuditLog(query);
  } catch (error) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('audit.errors.load'), life: 5000 });
  }
}

function applyFilters() {
  if (rangeInvalid.value) return;
  load(new AuditLogQuery({ ...filters, page: 1, pageSize: store.auditQuery.pageSize }));
}

function clearFilters() {
  Object.assign(filters, { userId: null, action: null, from: '', to: '' });
  applyFilters();
}

function onPage(event) {
  load(store.auditQuery.with({ page: event.page + 1, pageSize: event.rows }));
}

onMounted(async () => {
  // Users feed the "user" filter; the audit itself does not depend on them.
  if (store.users.length === 0) store.fetchUsers().catch(() => {});
  await load(new AuditLogQuery());
});
</script>
