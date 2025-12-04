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

      <div v-if="roomStore.loading" class="text-center p-8">
        <pv-progress-spinner />
      </div>

      <pv-card v-else class="surface-card shadow-2 border-round-xl">
        <template #content>
          <div class="grid p-fluid formgrid">

            <div class="col-12 mb-4">
              <label class="font-bold text-color block mb-2">Tipo de Habitación</label>
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
                  <div class="flex align-items-center">
                    <div>{{ slotProps.option.name }}</div>
                    <span class="ml-2 text-color-secondary text-xs">- {{ slotProps.option.description }}</span>
                  </div>
                </template>
              </pv-select>
              <small v-if="submitted && !form.roomTypeId" class="p-error">Debes seleccionar un tipo.</small>
            </div>

            <div class="col-12 mb-4">
              <label class="font-bold text-color block mb-2">Descripción de la Unidad</label>
              <pv-textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Ej. Habitación 204 con vista al jardín..."
                  :class="{ 'p-invalid': submitted && !form.description }"
              />
              <small v-if="submitted && !form.description" class="p-error">La descripción es obligatoria.</small>
            </div>

            <div class="col-12 mb-4">
              <label class="font-bold text-color block mb-2">Comodidades</label>
              <div class="flex gap-3 flex-wrap">
                <div v-for="opt in roomAmenityOptions" :key="opt" class="field-checkbox">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useRoomStore } from '@/accommodations/application/room.store.js';

const router = useRouter();
const toast = useToast();
const roomStore = useRoomStore();

const submitted = ref(false);
const isSaving = ref(false);

const form = reactive({
  roomTypeId: null,
  description: '',
  amenities: []
});

const roomAmenityOptions = ['TV Smart', 'WiFi', 'Aire Acondicionado', 'Minibar', 'Jacuzzi', 'Caja Fuerte', 'Vista al Mar', 'Escritorio', 'Balcón'];

onMounted(async () => {
  // Necesitamos cargar los tipos para el dropdown
  await roomStore.fetchAllRoomTypes();
});

const goBack = () => router.push({ name: 'staff-rooms' });

const submitForm = async () => {
  submitted.value = true;

  if (!form.roomTypeId || !form.description) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Completa los campos requeridos.', life: 3000 });
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      roomTypeId: form.roomTypeId,
      description: form.description,
      amenities: form.amenities
    };

    await roomStore.createRoom(payload);

    toast.add({ severity: 'success', summary: 'Registrado', detail: 'Habitación agregada al inventario.', life: 3000 });
    setTimeout(() => {
      router.push({ name: 'staff-rooms' });
    }, 1000);

  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar la habitación.', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};
</script>