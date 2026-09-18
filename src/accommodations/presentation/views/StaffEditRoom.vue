<template>
  <div class="p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-5xl">
      <div class="flex align-items-center gap-3 mb-6">
        <pv-button icon="pi pi-arrow-left" :label="t('common.cancel')" class="p-button-outlined p-button-sm" @click="goBack" />
        <h1 class="text-3xl font-bold text-color m-0">{{ t('staffRooms.editTitle', { number: roomStore.currentRoom?.label ?? '' }) }}</h1>
      </div>

      <div v-if="loadingData" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <pv-message v-else-if="!roomStore.currentRoom" severity="error">{{ t('staffRooms.notFound') }}</pv-message>
      <pv-message v-else-if="!allowed" severity="warn">{{ t('staffHotels.outOfScope') }}</pv-message>

      <pv-card v-else class="surface-card shadow-2 border-round-xl">
        <template #content>
          <RoomForm
              :form="form"
              :errors="errors"
              :hotels="hotelStore.hotels"
              :room-types="roomStore.roomTypes"
              :amenities="roomStore.amenitiesList"
              hotel-locked
              price-note
          />
          <pv-message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</pv-message>
          <div class="flex justify-content-end gap-2 border-top-1 surface-border pt-4">
            <pv-button :label="t('staffHotels.discard')" icon="pi pi-times" class="p-button-text p-button-secondary" @click="goBack" />
            <pv-button :label="t('staffHotels.saveChanges')" icon="pi pi-check" :loading="isSaving" @click="submitForm" />
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { validateRoomForm } from '@/accommodations/domain/room-rules.js';
import useIamStore from '@/iam/application/iam.store.js';
import { canManageHotel } from '@/iam/domain/user-role.js';
import { failureMessageKey, violationMessages } from '@/shared/presentation/utils/failure-message.js';
import RoomForm from '../components/RoomForm.vue';

/**
 * Edit a room. The hotel is read-only: PUT /rooms does not accept `hotelId`.
 */
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

const roomId = Number(route.params.roomId);
const loadingData = ref(true);
const isSaving = ref(false);
const errors = ref({});
const errorMessage = ref('');
const form = reactive({ hotelId: null, number: '', roomTypeId: null, price: null, description: '', amenities: [] });

const allowed = computed(() => canManageHotel(iamStore.currentUser, form.hotelId));

onMounted(async () => {
  await Promise.all([
    roomStore.fetchAllRoomTypes(),
    roomStore.fetchAmenities(),
    hotelStore.fetchAllHotels(),
    roomStore.fetchRoomById(roomId),
  ]);
  const room = roomStore.currentRoom;
  if (room) {
    Object.assign(form, {
      hotelId: room.hotelId,
      number: room.number ?? '',
      roomTypeId: room.roomTypeId,
      price: room.price,
      description: room.description,
      amenities: [...room.amenities],
    });
  }
  loadingData.value = false;
});

const goBack = () => router.push({ name: 'staff-rooms' });

async function submitForm() {
  errorMessage.value = '';
  const invalid = validateRoomForm(form);
  errors.value = violationMessages(t, invalid, 'staffRooms.rules');
  if (Object.keys(invalid).length > 0) return;

  isSaving.value = true;
  try {
    await roomStore.updateRoom(roomId, form);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffRooms.updated'), life: 3000 });
    router.push({ name: 'staff-rooms' });
  } catch (err) {
    if (err.hasFieldViolations) errors.value = violationMessages(t, err.fieldViolations, 'staffRooms.rules');
    else errorMessage.value = t(failureMessageKey(err, { forbidden: 'staffHotels.outOfScope', notFound: 'staffRooms.notFound' }));
  } finally {
    isSaving.value = false;
  }
}
</script>
