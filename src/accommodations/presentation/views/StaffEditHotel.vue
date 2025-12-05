<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-5xl">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" label="Cancelar" class="p-button-outlined p-button-sm" @click="goBack" />
          <h1 class="text-3xl font-bold text-color m-0">Editar Hotel</h1>
        </div>
      </div>

      <div v-if="loadingData" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <pv-card v-else class="surface-card shadow-2 border-round-xl">
        <template #content>
          <div class="grid p-fluid formgrid">

            <div class="col-12 md:col-8 field">
              <label for="name" class="font-bold text-color">Nombre de la Propiedad</label>
              <pv-input-text id="name" v-model="form.name" />
            </div>

            <div class="col-12 md:col-4 field">
              <label for="type" class="font-bold text-color">Tipo</label>
              <pv-select v-model="form.type" :options="hotelStore.categories" class="w-full" />
            </div>

            <div class="col-12 md:col-4 field">
              <label class="font-bold text-color">País</label>
              <pv-input-text v-model="form.country" />
            </div>
            <div class="col-12 md:col-4 field">
              <label class="font-bold text-color">Ciudad</label>
              <pv-input-text v-model="form.city" />
            </div>
            <div class="col-12 md:col-4 field">
              <label class="font-bold text-color">Dirección</label>
              <pv-input-text v-model="form.address" />
            </div>

            <div class="col-12 field">
              <label class="font-bold text-color">Descripción</label>
              <pv-textarea v-model="form.description" rows="3" />
            </div>

            <div class="col-12 field">
              <label class="font-bold text-color">URL Imagen</label>
              <pv-input-text v-model="form.imageUrl" />
            </div>

            <div class="col-12 field">
              <label class="font-bold text-color block mb-2">Amenidades</label>
              <div class="flex gap-3 flex-wrap mt-2">
                <div v-for="opt in hotelStore.amenitiesList" :key="opt" class="field-checkbox">
                  <pv-checkbox :inputId="opt" name="amenity" :value="opt" v-model="form.amenities" />
                  <label :for="opt" class="ml-2 text-color-secondary cursor-pointer">{{ opt }}</label>
                </div>
              </div>
            </div>

            <div class="col-12 mt-4 flex justify-content-end gap-2 pt-4 border-top-1 surface-border">
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const hotelStore = useHotelStore();

const hotelId = Number(route.params.hotelId);
const loadingData = ref(true);
const isSaving = ref(false);

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

onMounted(async () => {
  try {
    // Cargar opciones y datos del hotel en paralelo
    await Promise.all([
      hotelStore.fetchOptions(),
      hotelStore.fetchHotelById(hotelId)
    ]);

    // Llenar formulario con datos existentes
    const hotel = hotelStore.currentHotel;
    if (hotel) {
      form.name = hotel.name;
      form.address = hotel.address || hotel.location?.split(',')[0] || ''; // Fallback de parseo simple
      form.city = hotel.city;
      form.country = hotel.country;
      form.description = hotel.description;
      form.imageUrl = hotel.photoUrl; // Nota: Assembler usa photoUrl, API usa imageUrl
      form.type = hotel.type;
      form.amenities = hotel.amenities ? [...hotel.amenities] : [];
    } else {
      throw new Error("Hotel no encontrado");
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos.', life: 3000 });
    goBack();
  } finally {
    loadingData.value = false;
  }
});

const goBack = () => router.push({ name: 'staff-hotels' });

const submitForm = async () => {
  isSaving.value = true;
  try {
    const payload = {
      name: form.name,
      address: form.address,
      city: form.city,
      country: form.country,
      description: form.description,
      imageUrl: form.imageUrl,
      type: form.type,
      amenities: form.amenities
    };

    await hotelStore.updateHotel(hotelId, payload);

    toast.add({ severity: 'success', summary: 'Actualizado', detail: 'Cambios guardados correctamente.', life: 3000 });
    setTimeout(() => {
      router.push({ name: 'staff-hotels' });
    }, 1000);

  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar.', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};
</script>