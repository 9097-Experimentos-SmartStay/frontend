<template>
  <div class="p-4 md:p-6">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog />

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex flex-wrap gap-3 justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" :aria-label="t('common.back')" @click="router.push({ name: 'staff-dashboard' })" />
        <div>
          <h1 class="text-2xl font-bold text-color m-0">{{ t('users.title') }}</h1>
          <p class="text-color-secondary m-0">{{ isChainAdmin ? t('users.subtitle') : t('users.subtitleAdmin') }}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <pv-button
            v-if="iamStore.can(Capability.VIEW_AUDIT_LOG)"
            :label="t('users.auditLog')"
            icon="pi pi-history"
            class="p-button-outlined"
            @click="router.push({ name: 'staff-audit-log' })"
        />
        <pv-button :label="t('users.newUser')" icon="pi pi-user-plus" :disabled="needsHotel" @click="openCreateDialog" />
      </div>
    </div>

    <!-- D2: an admin without a hotel must register it before creating staff (backend answers 409) -->
    <pv-message v-if="needsHotel" severity="warn" class="mb-4">
      <strong class="block mb-1">{{ t('users.noHotelTitle') }}</strong>
      {{ t('users.noHotelMessage') }}
      <pv-button
          v-if="canRegisterHotel(currentUser)"
          :label="t('users.registerHotel')"
          icon="pi pi-building"
          class="p-button-sm mt-2 block"
          @click="router.push({ name: 'create-hotel' })"
      />
    </pv-message>

    <div class="surface-card p-4 shadow-2 border-round">
      <div class="mb-3">
        <pv-icon-field>
          <pv-input-icon class="pi pi-search" />
          <pv-input-text v-model="search" :placeholder="t('users.search')" class="w-full md:w-20rem" />
        </pv-icon-field>
      </div>

      <pv-data-table
          :value="filteredUsers"
          :loading="store.loadingUsers"
          data-key="id"
          paginator
          :rows="10"
          responsive-layout="scroll"
          class="p-datatable-sm"
      >
        <template #empty>{{ t('users.empty') }}</template>

        <pv-column :header="t('users.columns.name')" sortable sort-field="displayName">
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <pv-avatar :label="data.initials" shape="circle" class="bg-primary text-white" />
              <div class="flex flex-column">
                <span class="font-semibold text-color">
                  {{ data.displayName }}
                  <pv-tag v-if="data.id === currentUser?.id" :value="t('users.you')" severity="info" class="ml-1" />
                </span>
                <span class="text-sm text-color-secondary">{{ data.email }}</span>
              </div>
            </div>
          </template>
        </pv-column>

        <pv-column field="role" :header="t('users.columns.role')" sortable>
          <template #body="{ data }">{{ roleLabel(data.role) }}</template>
        </pv-column>

        <pv-column v-if="isChainAdmin" field="hotelId" :header="t('users.columns.hotel')" sortable>
          <template #body="{ data }">{{ hotelName(data.hotelId) }}</template>
        </pv-column>

        <pv-column field="status" :header="t('users.columns.status')" sortable>
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <pv-tag :value="t(`users.status.${data.status}`)" :severity="data.isActive ? 'success' : 'secondary'" rounded />
              <pv-tag v-if="data.isLocked()" :value="t('users.status.locked')" severity="danger" rounded />
              <pv-tag v-if="!data.emailVerified" :value="t('users.status.unverified')" severity="warn" rounded />
              <template v-if="data.usesSecondFactor">
                <pv-tag v-if="data.mfaEnabled" :value="t('users.status.mfaEnabled')" severity="info" icon="pi pi-shield" rounded />
                <pv-tag v-else :value="t('users.status.mfaPending')" severity="secondary" icon="pi pi-shield" rounded />
              </template>
            </div>
          </template>
        </pv-column>

        <pv-column field="createdAt" :header="t('users.columns.createdAt')" sortable>
          <template #body="{ data }">{{ data.createdAt ? data.createdAt.toLocaleDateString(locale) : '—' }}</template>
        </pv-column>

        <pv-column :header="t('users.columns.actions')" style="width: 13rem">
          <template #body="{ data }">
            <div v-if="isManageable(data)" class="flex gap-1">
              <pv-button
                  icon="pi pi-id-card"
                  class="p-button-rounded p-button-text p-button-info"
                  v-tooltip.top="t('users.changeRole')"
                  :aria-label="t('users.changeRole')"
                  :disabled="!data.isActive"
                  @click="openRoleDialog(data)"
              />
              <pv-button
                  v-if="data.usesSecondFactor && data.mfaEnabled"
                  icon="pi pi-shield"
                  class="p-button-rounded p-button-text p-button-warning"
                  v-tooltip.top="t('users.resetMfa')"
                  :aria-label="t('users.resetMfa')"
                  @click="confirmResetMfa(data)"
              />
              <pv-button
                  v-if="data.isActive"
                  icon="pi pi-ban"
                  class="p-button-rounded p-button-text p-button-danger"
                  v-tooltip.top="t('users.deactivate')"
                  :aria-label="t('users.deactivate')"
                  @click="confirmDeactivate(data)"
              />
              <pv-button
                  v-else
                  icon="pi pi-check-circle"
                  class="p-button-rounded p-button-text p-button-success"
                  v-tooltip.top="t('users.activate')"
                  :aria-label="t('users.activate')"
                  @click="confirmActivate(data)"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <CreateUserDialog
        v-model:visible="createDialogVisible"
        :roles="assignableRoles"
        :hotels="hotelStore.hotels"
        :requires-hotel-choice="isChainAdmin"
        @created="onUserCreated"
    />

    <pv-dialog
        v-model:visible="roleDialog.visible"
        modal
        :header="t('users.roleDialog.title', { name: roleDialog.user?.displayName ?? '' })"
        :style="{ width: '26rem' }"
    >
      <div class="field">
        <label for="newRole" class="block mb-2 font-medium">{{ t('users.roleDialog.newRole') }}</label>
        <pv-select
            v-model="roleDialog.role"
            input-id="newRole"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            class="w-full"
        />
        <small class="block mt-2 text-color-secondary">{{ t('users.roleDialog.hint') }}</small>
      </div>
      <template #footer>
        <pv-button :label="t('common.cancel')" class="p-button-text" @click="roleDialog.visible = false" />
        <pv-button
            :label="t('users.roleDialog.submit')"
            :loading="roleDialog.saving"
            :disabled="!roleDialog.role || roleDialog.role === roleDialog.user?.role"
            @click="saveRole"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import CreateUserDialog from '../components/create-user-dialog.vue';
import useIamStore from '../../application/iam.store.js';
import { useUserManagementStore } from '../../application/user-management.store.js';
import { AuthFailureReason } from '../../application/auth-failure.js';
import { Capability, UserRole, assignableRolesFor, canRegisterHotel } from '../../domain/user-role.js';
import { authFailureMessage } from '../utils/auth-messages.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';

/**
 * US-03: user administration for admin (their hotel) and chain_admin (everyone).
 */
const { t, locale } = useI18n();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const iamStore = useIamStore();
const store = useUserManagementStore();
const hotelStore = useHotelStore();

const search = ref('');
const createDialogVisible = ref(false);
const roleDialog = reactive({ visible: false, user: null, role: null, saving: false });

const currentUser = computed(() => iamStore.currentUser);
const isChainAdmin = computed(() => iamStore.role === UserRole.CHAIN_ADMIN);
const needsHotel = computed(() => iamStore.role === UserRole.ADMIN && currentUser.value?.hotelId == null);
const assignableRoles = computed(() => assignableRolesFor(iamStore.role));
const roleOptions = computed(() => assignableRoles.value.map((role) => ({ value: role, label: roleLabel(role) })));

const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return store.users;
  return store.users.filter((user) => `${user.displayName} ${user.email}`.toLowerCase().includes(query));
});

const roleLabel = (role) => (role ? t(`roles.${role}`) : '—');
const hotelName = (hotelId) => {
  if (hotelId == null) return '—';
  return hotelStore.hotels.find((hotel) => hotel.id === hotelId)?.name ?? `#${hotelId}`;
};

/** Never act on yourself; only on accounts whose role you could assign (the backend has the last word). */
function isManageable(user) {
  return user.id !== currentUser.value?.id && assignableRoles.value.includes(user.role);
}

function showError(error) {
  const reason = error?.reason;
  let detail;
  if (reason === AuthFailureReason.FORBIDDEN) detail = t('users.errors.forbiddenRole');
  else if (reason === AuthFailureReason.NOT_FOUND) detail = t('users.errors.notFound');
  else detail = authFailureMessage(t, locale.value, error);
  toast.add({ severity: 'error', summary: t('common.error'), detail, life: 5000 });
}

async function load() {
  try {
    await Promise.all([store.fetchUsers(), isChainAdmin.value ? hotelStore.fetchAllHotels() : Promise.resolve()]);
  } catch (error) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('users.errors.load'), life: 5000 });
  }
}

function openCreateDialog() {
  createDialogVisible.value = true;
}

function onUserCreated(user) {
  toast.add({
    severity: 'success',
    summary: t('common.success'),
    detail: t('users.create.success', { email: user.email, role: roleLabel(user.role) }),
    life: 4000,
  });
}

function openRoleDialog(user) {
  Object.assign(roleDialog, { visible: true, user, role: user.role, saving: false });
}

async function saveRole() {
  roleDialog.saving = true;
  try {
    await store.changeRole(roleDialog.user.id, roleDialog.role);
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('users.roleDialog.success', { name: roleDialog.user.displayName, role: roleLabel(roleDialog.role) }),
      life: 4000,
    });
    roleDialog.visible = false;
  } catch (error) {
    showError(error);
  } finally {
    roleDialog.saving = false;
  }
}

function confirmDeactivate(user) {
  confirm.require({
    header: t('users.confirmDeactivate.header'),
    message: t('users.confirmDeactivate.message', { name: user.displayName }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('users.deactivate'), severity: 'danger' },
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    accept: async () => {
      try {
        await store.deactivateUser(user.id);
        toast.add({ severity: 'success', summary: t('common.success'), detail: t('users.confirmDeactivate.success', { name: user.displayName }), life: 4000 });
      } catch (error) {
        showError(error);
      }
    },
  });
}

/** US-52 scenario 4: the staff member lost the device and the recovery codes. */
function confirmResetMfa(user) {
  confirm.require({
    header: t('users.confirmResetMfa.header'),
    message: t('users.confirmResetMfa.message', { name: user.displayName }),
    icon: 'pi pi-shield',
    acceptProps: { label: t('users.resetMfa'), severity: 'warn' },
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    accept: async () => {
      try {
        await store.resetMfa(user.id);
        toast.add({ severity: 'success', summary: t('common.success'), detail: t('users.confirmResetMfa.success', { name: user.displayName }), life: 5000 });
      } catch (error) {
        showError(error);
      }
    },
  });
}

function confirmActivate(user) {
  confirm.require({
    header: t('users.confirmActivate.header'),
    message: t('users.confirmActivate.message', { name: user.displayName }),
    icon: 'pi pi-question-circle',
    acceptProps: { label: t('users.activate') },
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    accept: async () => {
      try {
        await store.activateUser(user.id);
        toast.add({ severity: 'success', summary: t('common.success'), detail: t('users.confirmActivate.success', { name: user.displayName }), life: 4000 });
      } catch (error) {
        showError(error);
      }
    },
  });
}

onMounted(load);
</script>
