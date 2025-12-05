<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-5xl">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" label="Cancelar" class="p-button-outlined p-button-sm" @click="goBack" />
          <h1 class="text-3xl font-bold text-color m-0">Registrar Nuevo Hotel</h1>
        </div>
      </div>

      <pv-card class="surface-card shadow-2 border-round-xl">
        <template #content>
          <div class="grid p-fluid formgrid">

            <div class="col-12 md:col-8 field">
              <label for="name" class="font-bold text-color">Nombre de la Propiedad</label>
              <pv-input-text id="name" v-model="form.name" placeholder="Ej. Gran Hotel Bolívar" :class="{ 'p-invalid': submitted && !form.name }" />
              <small v-if="submitted && !form.name" class="p-error">El nombre es obligatorio.</small>
            </div>

            <div class="col-12 md:col-4 field">
              <label for="type" class="font-bold text-color">Tipo de Alojamiento</label>
              <div class="p-inputgroup">
                <pv-select
                    id="type"
                    v-model="form.type"
                    :options="hotelStore.categories"
                    placeholder="Selecciona uno"
                    class="w-full"
                    :loading="hotelStore.loading"
                />
                <pv-button icon="pi pi-plus" class="p-button-success" @click="showAddCategoryDialog" v-tooltip.top="'Nueva Categoría'" />
              </div>
            </div>

            <div class="col-12 field">
              <label for="location" class="font-bold text-color">Ubicación (Ciudad, País)</label>
              <pv-input-text id="location" v-model="form.location" placeholder="Ej. Miraflores, Lima" />
            </div>

            <div class="col-12 field">
              <label for="description" class="font-bold text-color">Descripción</label>
              <pv-textarea id="description" v-model="form.description" rows="4" placeholder="Describe la experiencia..." />
            </div>

            <div class="col-12 md:col-6 field">
              <label for="price" class="font-bold text-color">Precio Base (Noche)</label>
              <pv-input-number id="price" v-model="form.basePrice" mode="currency" currency="USD" locale="en-US" />
            </div>

            <div class="col-12 md:col-6 field">
              <label for="image" class="font-bold text-color">URL de Imagen</label>
              <div class="p-inputgroup">
                <span class="p-inputgroup-addon"><i class="pi pi-image"></i></span>
                <pv-input-text id="image" v-model="form.imageUrl" placeholder="https://..." />
              </div>
            </div>

            <div class="col-12 field">
              <div class="flex align-items-center gap-2 mb-2">
                <label class="font-bold text-color m-0">Amenidades del Hotel</label>
                <pv-button icon="pi pi-plus" class="p-button-rounded p-button-text p-button-sm p-button-success" @click="showAddAmenityDialog" v-tooltip.top="'Crear Nueva Amenidad'" />
              </div>

              <div v-if="hotelStore.loading" class="flex gap-3">
                <pv-skeleton width="6rem" height="2rem"></pv-skeleton>
                <pv-skeleton width="6rem" height="2rem"></pv-skeleton>
                <pv-skeleton width="6rem" height="2rem"></pv-skeleton>
              </div>

              <div v-else class="flex gap-3 flex-wrap mt-2">
                <div v-for="opt in hotelStore.amenitiesList" :key="opt" class="field-checkbox mr-2 align-items-center">
                  <pv-checkbox :inputId="opt" name="amenity" :value="opt" v-model="form.amenities" />
                  <label :for="opt" class="ml-2 text-color-secondary cursor-pointer">{{ opt }}</label>
                </div>
              </div>
              <small class="text-500 mt-2 block" v-if="hotelStore.amenitiesList.length === 0 && !hotelStore.loading">No se cargaron amenidades. Verifica el backend.</small>
            </div>

            <div class="col-12 mt-4 flex justify-content-end gap-2 border-top-1 surface-border pt-4">
              <pv-button label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary" @click="goBack" />
              <pv-button label="Guardar Hotel" icon="pi pi-check" class="p-button-primary" :loading="hotelStore.loading" @click="submitForm" />
            </div>

          </div>
        </template>
      </pv-card>
    </div>

    <AddCategoryDialog v-model="isCategoryDialogVisible" @category-added="onCategoryAdded" />
    <AddAmenityDialog v-model="isAmenityDialogVisible" @amenity-added="onAmenityAdded" />

  </div>
</template>

<script setup>
/**
 * @file StaffCreateHotel.vue
 * @description View component for creating new Hotel Resources.
 * Allows staff to define properties, categories, and amenities dynamically.
 */

import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import useIamStore from '@/iam/application/iam.store.js';

// Import dynamic dialog components for Master Data creation
import AddCategoryDialog from '../components/AddCategoryDialog.vue';
import AddAmenityDialog from '../components/AddAmenityDialog.vue';

const router = useRouter();
const toast = useToast();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

// --- State Management ---
const submitted = ref(false);
const isCategoryDialogVisible = ref(false);
const isAmenityDialogVisible = ref(false);

/**
 * Reactive form state mapping to the CreateHotel Resource.
 */
const form = reactive({
  name: '',
  location: '',
  description: '',
  basePrice: null,
  imageUrl: '',
  type: null,
  amenities: []
});

// --- Lifecycle ---
onMounted(async () => {
  // Load Master Data (Categories and Amenities) from the backend
  await hotelStore.fetchOptions();
});

// --- Navigation & UI Actions ---

const goBack = () => router.push({ name: 'staff-hotels' });

const showAddCategoryDialog = () => {
  isCategoryDialogVisible.value = true;
};

const showAddAmenityDialog = () => {
  isAmenityDialogVisible.value = true;
};

/**
 * Callback when a new category is created via dialog.
 * Automatically selects the newly created category.
 * @param {string} newCategoryName - The name of the created category.
 */
const onCategoryAdded = (newCategoryName) => {
  form.type = newCategoryName;
};

/**
 * Callback when a new amenity is created via dialog.
 * Automatically adds the newly created amenity to the selection.
 * @param {string} newAmenityName - The name of the created amenity.
 */
const onAmenityAdded = (newAmenityName) => {
  if (!form.amenities.includes(newAmenityName)) {
    form.amenities.push(newAmenityName);
  }
};

/**
 * Handles form submission.
 * Validates input and dispatches the create action to the store.
 */
const submitForm = async () => {
  submitted.value = true;

  // Basic Domain Validation
  if (!form.name || !form.location || !form.basePrice || !form.type) {
    toast.add({ severity: 'warn', summary: 'Missing Data', detail: 'Please complete all required fields.', life: 3000 });
    return;
  }

  try {
    // Construct the Payload for the API
    const payload = {
      hostId: iamStore.currentUserId,
      name: form.name,
      location: form.location,
      description: form.description,
      basePrice: Number(form.basePrice),
      imageUrl: form.imageUrl || 'https://placehold.co/600x400/3498DB/FFFFFF?text=New+Hotel',
      type: form.type,
      amenities: form.amenities
    };

    // Dispatch action to Application Layer
    await hotelStore.createHotel(payload);

    toast.add({ severity: 'success', summary: 'Success', detail: 'Hotel created successfully.', life: 3000 });
    setTimeout(() => {
      router.push({ name: 'staff-hotels' });
    }, 1000);

  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not create hotel.', life: 3000 });
  }
};
</script>