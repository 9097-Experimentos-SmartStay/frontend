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
              <pv-input-text
                  id="name"
                  v-model="form.name"
                  placeholder="Ej. Gran Hotel Bolívar"
                  :class="{ 'p-invalid': submitted && !form.name }"
              />
              <small v-if="submitted && !form.name" class="p-error">El nombre es obligatorio.</small>
            </div>

            <div class="col-12 md:col-4 field">
              <label for="type" class="font-bold text-color">Tipo</label>
              <div class="p-inputgroup">
                <pv-select
                    v-model="form.type"
                    :options="hotelStore.categories"
                    placeholder="Seleccionar"
                    class="w-full"
                    :loading="hotelStore.loading"
                    :class="{ 'p-invalid': submitted && !form.type }"
                />
                <pv-button icon="pi pi-plus" class="p-button-success" @click="showAddCategoryDialog" v-tooltip.top="'Nueva Categoría'" />
              </div>
              <small v-if="submitted && !form.type" class="p-error">Selecciona un tipo.</small>
            </div>

            <div class="col-12 md:col-4 field">
              <label for="country" class="font-bold text-color">País</label>
              <pv-input-text id="country" v-model="form.country" placeholder="Perú" :class="{ 'p-invalid': submitted && !form.country }" />
            </div>
            <div class="col-12 md:col-4 field">
              <label for="city" class="font-bold text-color">Ciudad</label>
              <pv-input-text id="city" v-model="form.city" placeholder="Lima" :class="{ 'p-invalid': submitted && !form.city }" />
            </div>
            <div class="col-12 md:col-4 field">
              <label for="address" class="font-bold text-color">Dirección</label>
              <pv-input-text id="address" v-model="form.address" placeholder="Av. Larco 123" :class="{ 'p-invalid': submitted && !form.address }" />
            </div>

            <div class="col-12 field">
              <label for="description" class="font-bold text-color">Descripción</label>
              <pv-textarea v-model="form.description" rows="3" placeholder="Describe la experiencia..." />
            </div>

            <div class="col-12 field">
              <div class="flex justify-content-between align-items-center mb-2">
                <label class="font-bold text-color block">Imagen Principal</label>
                <pv-select-button v-model="imageMode" :options="['Subir Foto', 'URL Directa']" class="p-button-sm" />
              </div>

              <div v-if="imageMode === 'URL Directa'" class="p-inputgroup mb-3">
                <span class="p-inputgroup-addon"><i class="pi pi-link"></i></span>
                <pv-input-text v-model="form.imageUrl" placeholder="https://ejemplo.com/foto.jpg" />
              </div>

              <div v-else-if="!form.imageUrl && imageMode === 'Subir Foto'" class="border-2 border-dashed surface-border border-round p-5 flex flex-column align-items-center justify-content-center surface-ground">
                <i class="pi pi-cloud-upload text-4xl text-color-secondary mb-3"></i>
                <pv-file-upload
                    mode="basic"
                    name="file"
                    accept="image/*"
                    :maxFileSize="1000000"
                    customUpload
                    @uploader="onUploadImage"
                    auto
                    chooseLabel="Seleccionar Archivo"
                    class="p-button-outlined"
                />
                <small class="text-color-secondary mt-2">Máximo 1MB (JPG, PNG)</small>
              </div>

              <div v-if="form.imageUrl" class="relative w-full h-15rem border-round overflow-hidden shadow-1 mt-3">
                <img :src="form.imageUrl" class="w-full h-full object-cover" alt="Preview" @error="onImageError" />
                <pv-button icon="pi pi-times" class="p-button-rounded p-button-danger absolute top-0 right-0 m-2" @click="form.imageUrl = ''" v-tooltip="'Eliminar imagen'" />
              </div>
            </div>

            <div class="col-12 field">
              <div class="flex align-items-center gap-2 mb-2">
                <label class="font-bold text-color m-0">Amenidades</label>
                <pv-button icon="pi pi-plus" class="p-button-rounded p-button-text p-button-sm p-button-success" @click="showAddAmenityDialog" v-tooltip.top="'Nueva Amenidad'" />
              </div>

              <div v-if="hotelStore.loading && hotelStore.amenitiesList.length === 0" class="flex gap-3">
                <pv-skeleton width="6rem" height="2rem" />
                <pv-skeleton width="6rem" height="2rem" />
              </div>

              <div v-else class="flex gap-3 flex-wrap mt-2">
                <div v-for="opt in hotelStore.amenitiesList" :key="opt" class="field-checkbox align-items-center">
                  <pv-checkbox :inputId="opt" name="amenity" :value="opt" v-model="form.amenities" />
                  <label :for="opt" class="ml-2 text-color-secondary cursor-pointer">{{ opt }}</label>
                </div>
              </div>
            </div>

            <div class="col-12 mt-4 flex justify-content-end gap-2 pt-4 border-top-1 surface-border">
              <pv-button label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary" @click="goBack" />
              <pv-button label="Guardar Hotel" icon="pi pi-check" class="p-button-primary" :loading="isSaving" @click="submitForm" />
            </div>

          </div>
        </template>
      </pv-card>
    </div>

    <AddCategoryDialog v-model="isCategoryDialogVisible" @category-added="(n) => form.type = n" />
    <AddAmenityDialog v-model="isAmenityDialogVisible" @amenity-added="(n) => form.amenities.push(n)" />

  </div>
</template>

<script setup>
/**
 * @file StaffCreateHotel.vue
 * @description View component for creating new Hotel resources.
 * Allows staff to define hotel properties, upload images, and manage amenities dynamically.
 */

import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Domain Stores
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import useIamStore from '@/iam/application/iam.store.js';

// UI Components
import AddCategoryDialog from '../components/AddCategoryDialog.vue';
import AddAmenityDialog from '../components/AddAmenityDialog.vue';

// --- Setup ---
const router = useRouter();
const toast = useToast();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

// --- State ---
const submitted = ref(false);
const isSaving = ref(false);
const isCategoryDialogVisible = ref(false);
const isAmenityDialogVisible = ref(false);
const imageMode = ref('Subir Foto'); // Toggles between URL input and File Upload

/**
 * Reactive form state mapping to CreateHotelResource.
 */
const form = reactive({
  name: '',
  address: '',
  city: '',
  country: '',
  description: '',
  imageUrl: '',
  type: null,
  amenities: []
});

// --- Lifecycle ---

/**
 * Initializes the component by fetching master data (categories, amenities).
 */
onMounted(async () => {
  await hotelStore.fetchOptions();
});

// --- Navigation & Dialogs ---

const goBack = () => router.push({ name: 'staff-hotels' });
const showAddCategoryDialog = () => isCategoryDialogVisible.value = true;
const showAddAmenityDialog = () => isAmenityDialogVisible.value = true;

// --- Image Handling ---

/**
 * Fallback handler for broken image URLs.
 * @param {Event} event - The error event.
 */
const onImageError = (event) => {
  event.target.src = 'https://placehold.co/600x400/FF5733/FFFFFF?text=Invalid+Image';
};

/**
 * Uploads the selected image through the hotel store.
 * @param {Object} event - The PrimeVue FileUpload event containing the file.
 */
const onUploadImage = async (event) => {
  const file = event.files[0];

  try {
    toast.add({ severity: 'info', summary: 'Uploading', detail: 'Processing image...', life: 2000 });
    form.imageUrl = await hotelStore.uploadHotelImage(file);
    toast.add({ severity: 'success', summary: 'Uploaded', detail: 'Image uploaded successfully.', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Upload Failed', detail: 'Could not upload image.', life: 3000 });
  }
};

// --- Submission ---

/**
 * Submits the form to create a new Hotel.
 * Validates input, constructs payload, and dispatches to store.
 */
const submitForm = async () => {
  submitted.value = true;

  // Domain Validation (Required Fields)
  if (!form.name || !form.address || !form.city || !form.country || !form.type) {
    toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please complete all required fields.', life: 3000 });
    return;
  }

  // Host Validation
  const hostId = Number(iamStore.currentUserId);
  if (!hostId) {
    toast.add({ severity: 'error', summary: 'Session Error', detail: 'User ID not found. Please re-login.', life: 3000 });
    return;
  }

  isSaving.value = true;
  try {
    // Construct Payload (Matches Backend CreateHotelResource)
    const payload = {
      hostId: hostId,
      name: form.name,
      address: form.address,
      city: form.city,
      country: form.country,
      description: form.description,
      // basePrice is removed from Entity, sending 0 as placeholder if needed by DTO, or omitting if DTO updated.
      // Assuming Backend DTO removed BasePrice as per previous instructions.
      imageUrl: form.imageUrl || 'https://placehold.co/600x400/3498DB/FFFFFF?text=New+Hotel',
      type: form.type,
      amenities: form.amenities
    };

    await hotelStore.createHotel(payload);

    toast.add({ severity: 'success', summary: 'Success', detail: 'Hotel created successfully.', life: 3000 });

    // Redirect
    setTimeout(() => router.push({ name: 'staff-hotels' }), 1000);

  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create hotel.', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};
</script>