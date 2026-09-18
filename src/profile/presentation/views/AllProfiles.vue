<template>
  <div class="p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" :label="t('common.back')" class="p-button-outlined p-button-sm" @click="router.push({ name: 'staff-dashboard' })" />
          <h1 class="text-3xl font-bold text-color m-0">{{ t('allProfiles.title') }}</h1>
        </div>
      </div>

      <pv-message v-if="profileStore.error" severity="error" class="mb-4">{{ t(apiErrorKey(profileStore.error)) }}</pv-message>

      <div class="surface-card p-4 shadow-2 border-round">
        <pv-data-table
            :value="profileStore.guests"
            :loading="profileStore.loading"
            data-key="id"
            paginator
            :rows="10"
            responsive-layout="scroll"
            class="p-datatable-sm"
        >
          <template #empty>{{ t('allProfiles.noProfiles') }}</template>
          <pv-column field="fullName" :header="t('allProfiles.name')" sortable>
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <pv-avatar :label="data.initials" shape="circle" class="bg-primary text-white" />
                <span class="font-semibold">{{ data.fullName }}</span>
              </div>
            </template>
          </pv-column>
          <pv-column field="email" :header="t('allProfiles.email')" sortable />
          <pv-column field="phone" :header="t('profileDetail.phone')" />
          <pv-column :header="t('allProfiles.address')">
            <template #body="{ data }">{{ data.fullAddress || '—' }}</template>
          </pv-column>
          <pv-column field="status" :header="t('bookings.status')">
            <template #body="{ data }">
              <pv-tag :value="t(`users.status.${data.status}`)" :severity="data.isActive ? 'success' : 'secondary'" rounded />
            </template>
          </pv-column>
        </pv-data-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../../application/profile.store.js';
import { apiErrorKey } from '@/shared/presentation/utils/api-error.js';

/**
 * Guest directory of the staff area (GET /guests: reception, admin, chain_admin).
 */
const router = useRouter();
const { t } = useI18n();
const profileStore = useProfileStore();

onMounted(() => profileStore.fetchGuests());
</script>
