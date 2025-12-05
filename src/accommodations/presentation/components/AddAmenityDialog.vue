<template>
  <pv-dialog
      v-model:visible="visible"
      header="Nueva Amenidad"
      :modal="true"
      class="p-fluid"
      :style="{ width: '400px' }"
  >
    <div class="field">
      <label for="amenityName" class="font-bold">Nombre</label>
      <pv-input-text
          id="amenityName"
          v-model="amenityName"
          placeholder="Ej. Helipuerto, Cancha de Tenis..."
          autofocus
          :class="{'p-invalid': submitted && !amenityName}"
          @keyup.enter="saveAmenity"
      />
      <small v-if="submitted && !amenityName" class="p-error">El nombre es requerido.</small>
    </div>

    <template #footer>
      <pv-button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="closeDialog" />
      <pv-button label="Guardar" icon="pi pi-check" class="p-button-primary" :loading="loading" @click="saveAmenity" />
    </template>
  </pv-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'amenity-added']);

const toast = useToast();
const hotelStore = useHotelStore();

const visible = ref(props.modelValue);
const amenityName = ref('');
const loading = ref(false);
const submitted = ref(false);

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if(val) { amenityName.value = ''; submitted.value = false; }
});

watch(visible, (val) => emit('update:modelValue', val));

const closeDialog = () => { visible.value = false; };

const saveAmenity = async () => {
  submitted.value = true;
  if (!amenityName.value.trim()) return;

  loading.value = true;
  try {
    await hotelStore.createAmenity(amenityName.value);
    toast.add({ severity: 'success', summary: 'Creado', detail: `Amenidad "${amenityName.value}" agregada.`, life: 3000 });
    emit('amenity-added', amenityName.value);
    closeDialog();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la amenidad.', life: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>