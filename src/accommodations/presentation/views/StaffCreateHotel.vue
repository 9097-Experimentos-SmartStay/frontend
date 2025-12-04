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
              <pv-select
                  id="type"
                  v-model="form.type"
                  :options="hotelTypes"
                  placeholder="Selecciona uno"
                  class="w-full"
              />
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
              <label class="font-bold text-color">Amenidades del Hotel</label>
              <div class="flex gap-2 flex-wrap mt-2">
                <div v-for="opt in amenityOptions" :key="opt" class="field-checkbox mr-4">
                  <pv-checkbox :inputId="opt" name="amenity" :value="opt" v-model="form.amenities" />
                  <label :for="opt" class="ml-2 text-color-secondary cursor-pointer">{{ opt }}</label>
                </div>
              </div>
            </div>

            <div class="col-12 mt-4 flex justify-content-end gap-2 border-top-1 surface-border pt-4">
              <pv-button label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary" @click="goBack" />
              <pv-button label="Guardar Hotel" icon="pi pi-check" class="p-button-primary" :loading="hotelStore.loading" @click="submitForm" />
            </div>

          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
// Importa tu store de IAM si necesitas el hostId del usuario logueado
import useIamStore from '@/iam/application/iam.store.js';

const router = useRouter();
const toast = useToast();
const hotelStore = useHotelStore();
const iamStore = useIamStore();

const submitted = ref(false);

const form = reactive({
  name: '',
  location: '',
  description: '',
  basePrice: null,
  imageUrl: '',
  type: 'Hotel',
  amenities: []
});

const hotelTypes = ['Hotel', 'Posada', 'Lodge', 'Hostal', 'Cabaña', 'Resort'];
const amenityOptions = ['Wifi', 'Piscina', 'Gimnasio', 'Restaurante', 'Parking', 'Spa', 'Bar', 'Desayuno'];

const goBack = () => router.push({ name: 'staff-hotels' });

const submitForm = async () => {
  submitted.value = true;

  // Validación básica
  if (!form.name || !form.location || !form.basePrice) {
    toast.add({ severity: 'warn', summary: 'Datos incompletos', detail: 'Por favor llena los campos obligatorios.', life: 3000 });
    return;
  }

  try {
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

    await hotelStore.createHotel(payload);

    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Hotel creado correctamente.', life: 3000 });
    setTimeout(() => {
      router.push({ name: 'staff-hotels' });
    }, 1000);

  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el hotel.', life: 3000 });
  }
};
</script>