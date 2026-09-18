<template>
  <div class="p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-5xl">
      <div class="flex align-items-center gap-3 mb-6">
        <pv-button icon="pi pi-arrow-left" :label="t('common.cancel')" class="p-button-outlined p-button-sm" @click="goBack" />
        <h1 class="text-3xl font-bold text-color m-0">{{ t('staffRooms.createTitle') }}</h1>
      </div>

      <pv-message v-if="!loading && manageableHotels.length === 0" severity="warn" class="mb-4">{{ t('staffRooms.noHotel') }}</pv-message>

      <pv-card class="surface-card shadow-2 border-round-xl">
        <template #content>
          <RoomForm
              :form="form"
              :errors="errors"
              :hotels="manageableHotels"
              :room-types="roomStore.roomTypes"
              :amenities="roomStore.amenitiesList"
              :hotel-locked="manageableHotels.length === 1"
              :can-add-room-type="iamStore.can(Capability.CREATE_ROOM_TYPES)"
              :can-add-amenity="iamStore.can(Capability.MANAGE_MASTER_DATA)"
              @add-type="isTypeDialogVisible = true"
              @add-amenity="isAmenityDialogVisible = true"
          />
          <pv-message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</pv-message>
          <div class="flex justify-content-end gap-2 border-top-1 surface-border pt-4">
            <pv-button :label="t('common.cancel')" icon="pi pi-times" class="p-button-text p-button-secondary" @click="goBack" />
            <pv-button :label="t('staffRooms.create')" icon="pi pi-save" class="p-button-success" :loading="isSaving" :disabled="manageableHotels.length === 0" @click="submitForm" />
          </div>
        </template>
      </pv-card>
    </div>

    <AddRoomTypeDialog v-model="isTypeDialogVisible" @type-added="(id) => form.roomTypeId = id" />
    <AddAmenityDialog v-model="isAmenityDialogVisible" @amenity-added="onAmenityAdded" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { validateRoomForm } from '@/accommodations/domain/room-rules.js';
import useIamStore from '@/iam/application/iam.store.js';
import { Capability, canManageHotel } from '@/iam/domain/user-role.js';
import { failureMessageKey, violationMessages } from '@/shared/presentation/utils/failure-message.js';
import RoomForm from '../components/RoomForm.vue';
import AddRoomTypeDialog from '../components/AddRoomTypeDialog.vue';
import AddAmenityDialog from '../components/AddAmenityDialog.vue';

/**
 * New room. An admin can only add rooms to their own hotel (the select shows only that one).
 */
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

const loading = ref(true);
const isSaving = ref(false);
const isTypeDialogVisible = ref(false);
const isAmenityDialogVisible = ref(false);
const errors = ref({});
const errorMessage = ref('');

const form = reactive({ hotelId: null, number: '', roomTypeId: null, price: null, description: '', amenities: [] });
const manageableHotels = computed(() => hotelStore.hotels.filter((hotel) => canManageHotel(iamStore.currentUser, hotel.id)));

watch(manageableHotels, (hotels) => {
  if (hotels.length === 1) form.hotelId = hotels[0].id;
});

onMounted(async () => {
  await Promise.all([roomStore.fetchAllRoomTypes(), roomStore.fetchAmenities(), hotelStore.fetchAllHotels()]);
  loading.value = false;
});

const goBack = () => router.push({ name: 'staff-rooms' });

async function onAmenityAdded(name) {
  await roomStore.fetchAmenities();
  if (!form.amenities.includes(name)) form.amenities.push(name);
}

async function submitForm() {
  errorMessage.value = '';
  const invalid = validateRoomForm(form);
  errors.value = violationMessages(t, invalid, 'staffRooms.rules');
  if (Object.keys(invalid).length > 0) return;

  isSaving.value = true;
  try {
    await roomStore.createRoom(form);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffRooms.created'), life: 3000 });
    router.push({ name: 'staff-rooms' });
  } catch (err) {
    // Per-field errors (number repeated in the hotel, price, type...) go under each input; nothing was saved.
    if (err.hasFieldViolations) errors.value = violationMessages(t, err.fieldViolations, 'staffRooms.rules');
    else errorMessage.value = t(failureMessageKey(err, { forbidden: 'staffHotels.outOfScope' }));
  } finally {
    isSaving.value = false;
  }
}
</script>
