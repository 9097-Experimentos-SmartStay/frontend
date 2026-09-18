<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-5xl">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" label="Cancelar" class="p-button-outlined p-button-sm" @click="goBack" />
          <h1 class="text-3xl font-bold text-color m-0">Nueva Habitación</h1>
        </div>
      </div>

      <pv-card class="surface-card shadow-2 border-round-xl">
        <template #content>
          <div class="grid p-fluid formgrid">

            <div class="col-12 md:col-6 mb-4">
              <label class="font-bold text-color block mb-2">Hotel / Propiedad</label>
              <pv-select
                  v-model="form.hotelId"
                  :options="hotelStore.hotels"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Selecciona el hotel"
                  class="w-full"
                  :class="{ 'p-invalid': submitted && !form.hotelId }"
              />
              <small v-if="submitted && !form.hotelId" class="p-error">Debes asignar un hotel.</small>
            </div>

            <div class="col-12 md:col-6 mb-4">
              <label class="font-bold text-color block mb-2">Tipo de Habitación</label>
              <div class="p-inputgroup">
                <pv-select
                    v-model="form.roomTypeId"
                    :options="roomStore.roomTypes"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Selecciona una categoría"
                    class="w-full"
                    :class="{ 'p-invalid': submitted && !form.roomTypeId }"
                >
                  <template #option="slotProps">
                    <div class="flex flex-column">
                      <span class="font-medium">{{ slotProps.option.name }}</span>
                      <span class="text-color-secondary text-xs">{{ slotProps.option.description }}</span>
                    </div>
                  </template>
                </pv-select>
                <pv-button icon="pi pi-plus" class="p-button-success" @click="showAddTypeDialog" v-tooltip.top="'Nuevo Tipo'" />
              </div>
              <small v-if="submitted && !form.roomTypeId" class="p-error">Debes seleccionar un tipo.</small>
            </div>

            <div class="col-12 md:col-4 mb-4">
              <label class="font-bold text-color block mb-2">Precio por Noche</label>
              <pv-input-number
                  v-model="form.price"
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  placeholder="$0.00"
                  :class="{ 'p-invalid': submitted && !form.price }"
              />
            </div>

            <div class="col-12 md:col-8 mb-4">
              <label class="font-bold text-color block mb-2">Descripción de la Unidad</label>
              <pv-textarea
                  v-model="form.description"
                  rows="1"
                  placeholder="Ej. Vista al mar, piso alto..."
                  autoResize
                  :class="{ 'p-invalid': submitted && !form.description }"
              />
              <small v-if="submitted && !form.description" class="p-error">La descripción es obligatoria.</small>
            </div>

            <div class="col-12 mb-4">
              <div class="flex align-items-center gap-2 mb-2">
                <label class="font-bold text-color m-0">Comodidades</label>
                <pv-button icon="pi pi-plus" class="p-button-rounded p-button-text p-button-sm p-button-success" @click="showAddAmenityDialog" v-tooltip.top="'Nueva Amenidad'" />
              </div>

              <div v-if="roomStore.loading && roomStore.amenitiesList.length === 0" class="flex gap-3">
                <pv-skeleton width="6rem" height="2rem" />
                <pv-skeleton width="6rem" height="2rem" />
              </div>

              <div v-else class="flex gap-3 flex-wrap">
                <div v-for="opt in roomStore.amenitiesList" :key="opt" class="field-checkbox">
                  <pv-checkbox :inputId="'room-'+opt" name="roomAmenity" :value="opt" v-model="form.amenities" />
                  <label :for="'room-'+opt" class="ml-2 text-color-secondary cursor-pointer">{{ opt }}</label>
                </div>
              </div>
            </div>

            <div class="col-12 mt-2 flex justify-content-end gap-2 border-top-1 surface-border pt-4">
              <pv-button label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary" @click="goBack" />
              <pv-button label="Registrar Habitación" icon="pi pi-save" class="p-button-success" :loading="isSaving" @click="submitForm" />
            </div>

          </div>
        </template>
      </pv-card>
    </div>

    <AddRoomTypeDialog v-model="isTypeDialogVisible" @type-added="onTypeAdded" />
    <AddAmenityDialog v-model="isAmenityDialogVisible" @amenity-added="onAmenityAdded" />

  </div>
</template>

<script setup>
import { reportError } from '@/shared/infrastructure/logging/report-error.js';
/**
 * @file StaffCreateRoom.vue
 * @description View component for creating new Room Resources within the Accommodations Bounded Context.
 * Orchestrates data loading from Hotel and Room stores and handles dynamic creation of master data (Types/Amenities).
 */

import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// --- Domain Application Stores ---
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';

// --- Presentation Components ---
import AddRoomTypeDialog from '../components/AddRoomTypeDialog.vue';
import AddAmenityDialog from '../components/AddAmenityDialog.vue';

const router = useRouter();
const toast = useToast();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();

// --- Local State ---
const submitted = ref(false);
const isSaving = ref(false);
const isTypeDialogVisible = ref(false);
const isAmenityDialogVisible = ref(false);

/**
 * Reactive form state mapping to CreateRoomResource.
 */
const form = reactive({
  hotelId: null,
  roomTypeId: null,
  price: null,
  description: '',
  amenities: []
});

// --- Lifecycle ---

/**
 * Initializes component by fetching required master data and aggregates.
 */
onMounted(async () => {
  await Promise.all([
    roomStore.fetchAllRoomTypes(),
    roomStore.fetchAmenities(),
    hotelStore.fetchAllHotels()
  ]);
});

// --- Navigation ---

const goBack = () => router.push({ name: 'staff-rooms' });

// --- Dialog Handlers ---

const showAddTypeDialog = () => { isTypeDialogVisible.value = true; };
const showAddAmenityDialog = () => { isAmenityDialogVisible.value = true; };

/**
 * Callback when a new Room Type is created.
 * Automatically selects the new type.
 * @param {number} newTypeId - The ID of the newly created type.
 */
const onTypeAdded = (newTypeId) => {
  form.roomTypeId = newTypeId;
};

/**
 * Callback when a new Amenity is created.
 * Automatically checks the new amenity.
 * @param {string} newAmenity - The name of the newly created amenity.
 */
const onAmenityAdded = (newAmenity) => {
  if (!form.amenities.includes(newAmenity)) {
    form.amenities.push(newAmenity);
  }
};

// --- Submission ---

/**
 * Submits the form data to create a new Room.
 * Validates input and delegates to the Room Store.
 */
const submitForm = async () => {
  submitted.value = true;

  // Client-side validation
  if (!form.hotelId || !form.roomTypeId || !form.price || !form.description) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Completa los campos requeridos.', life: 3000 });
    return;
  }

  isSaving.value = true;
  try {
    // Prepare Payload
    const payload = {
      hotelId: form.hotelId,
      roomTypeId: form.roomTypeId,
      price: Number(form.price),
      description: form.description,
      amenities: form.amenities
    };

    // Execute Command via Store
    await roomStore.createRoom(payload);

    toast.add({ severity: 'success', summary: 'Registrado', detail: 'Habitación agregada al inventario.', life: 3000 });

    // Redirect after success
    setTimeout(() => {
      router.push({ name: 'staff-rooms' });
    }, 1000);

  } catch (err) {
    reportError('Error creating room', err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar la habitación.', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};
</script>