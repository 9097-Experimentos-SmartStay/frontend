<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-5xl">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" label="Cancelar" class="p-button-outlined p-button-sm" @click="goBack" />
          <h1 class="text-3xl font-bold text-color m-0">Editar Habitación #{{ roomId }}</h1>
        </div>
      </div>

      <div v-if="loadingData" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <pv-card v-else class="surface-card shadow-2 border-round-xl">
        <template #content>
          <div class="grid p-fluid formgrid">

            <div class="col-12 md:col-6 mb-4">
              <label class="font-bold text-color block mb-2">Hotel / Propiedad</label>
              <pv-select
                  v-model="form.hotelId"
                  :options="hotelStore.hotels"
                  optionLabel="name"
                  optionValue="id"
                  class="w-full"
              />
            </div>

            <div class="col-12 md:col-6 mb-4">
              <label class="font-bold text-color block mb-2">Tipo de Habitación</label>
              <pv-select
                  v-model="form.roomTypeId"
                  :options="roomStore.roomTypes"
                  optionLabel="name"
                  optionValue="id"
                  class="w-full"
              />
            </div>

            <div class="col-12 md:col-4 mb-4">
              <label class="font-bold text-color block mb-2">Precio por Noche</label>
              <pv-input-number
                  v-model="form.price"
                  mode="currency"
                  currency="USD"
                  locale="en-US"
              />
            </div>

            <div class="col-12 md:col-8 mb-4">
              <label class="font-bold text-color block mb-2">Descripción</label>
              <pv-textarea v-model="form.description" rows="1" autoResize />
            </div>

            <div class="col-12 mb-4">
              <label class="font-bold text-color block mb-2">Comodidades</label>
              <div class="flex gap-3 flex-wrap">
                <div v-for="opt in roomStore.amenitiesList" :key="opt" class="field-checkbox">
                  <pv-checkbox :inputId="'room-'+opt" name="roomAmenity" :value="opt" v-model="form.amenities" />
                  <label :for="'room-'+opt" class="ml-2 text-color-secondary cursor-pointer">{{ opt }}</label>
                </div>
              </div>
            </div>

            <div class="col-12 mt-2 flex justify-content-end gap-2 border-top-1 surface-border pt-4">
              <pv-button label="Descartar" icon="pi pi-times" class="p-button-text p-button-secondary" @click="goBack" />
              <pv-button label="Guardar Cambios" icon="pi pi-check" class="p-button-primary" :loading="isSaving" @click="submitForm" />
            </div>

          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script setup>
/**
 * @file StaffEditRoom.vue
 * @description View component for updating existing Room Resources.
 */

import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();

const roomId = Number(route.params.roomId);
const loadingData = ref(true);
const isSaving = ref(false);

const form = reactive({
  hotelId: null,
  roomTypeId: null,
  price: null,
  description: '',
  amenities: []
});

onMounted(async () => {
  try {
    // Fetch all necessary data in parallel
    await Promise.all([
      roomStore.fetchAllRoomTypes(),
      roomStore.fetchAmenities(),
      hotelStore.fetchAllHotels(),
      roomStore.fetchRoomById(roomId)
    ]);

    // Populate form
    const room = roomStore.currentRoom;
    if (room) {
      form.hotelId = room.hotelId;
      form.roomTypeId = room.roomTypeId;
      form.price = room.price;
      form.description = room.description;
      form.amenities = room.amenities ? [...room.amenities] : [];
    } else {
      throw new Error("Room not found");
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos.', life: 3000 });
    goBack();
  } finally {
    loadingData.value = false;
  }
});

const goBack = () => router.push({ name: 'staff-rooms' });

const submitForm = async () => {
  if (!form.hotelId || !form.roomTypeId || !form.price || !form.description) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Completa los campos requeridos.', life: 3000 });
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      roomTypeId: form.roomTypeId,
      price: Number(form.price),
      description: form.description,
      amenities: form.amenities
    };

    await roomStore.updateRoom(roomId, payload);

    toast.add({ severity: 'success', summary: 'Actualizado', detail: 'Cambios guardados.', life: 3000 });
    setTimeout(() => {
      router.push({ name: 'staff-rooms' });
    }, 1000);

  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar.', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};
</script>