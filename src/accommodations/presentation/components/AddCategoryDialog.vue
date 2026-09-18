<template>
  <pv-dialog
      v-model:visible="visible"
      header="Nueva Categoría"
      :modal="true"
      class="p-fluid"
      :style="{ width: '400px' }"
  >
    <div class="field">
      <label for="categoryName" class="font-bold">Nombre</label>
      <pv-input-text
          id="categoryName"
          v-model="categoryName"
          placeholder="Ej. Bungalow, Glamping..."
          autofocus
          :class="{'p-invalid': submitted && !categoryName}"
          @keyup.enter="saveCategory"
      />
      <small v-if="submitted && !categoryName" class="p-error">El nombre es requerido.</small>
    </div>

    <template #footer>
      <pv-button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="closeDialog" />
      <pv-button label="Guardar" icon="pi pi-check" class="p-button-primary" :loading="loading" @click="saveCategory" />
    </template>
  </pv-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
// Importamos el Store para usar la acción de crear (que añadiremos luego)
import { useHotelStore } from '@/accommodations/application/hotel.store.js';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'category-added']);

const toast = useToast();
const hotelStore = useHotelStore();

const visible = ref(props.modelValue);
const categoryName = ref('');
const loading = ref(false);
const submitted = ref(false);

// Sincronizar v-model
watch(() => props.modelValue, (val) => {
  visible.value = val;
  if(val) {
    // Reset form al abrir
    categoryName.value = '';
    submitted.value = false;
  }
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const closeDialog = () => {
  visible.value = false;
};

const saveCategory = async () => {
  submitted.value = true;
  if (!categoryName.value.trim()) return;

  loading.value = true;
  try {

    await hotelStore.createCategory(categoryName.value);

    toast.add({ severity: 'success', summary: 'Creado', detail: `Categoría "${categoryName.value}" agregada.`, life: 3000 });
    emit('category-added', categoryName.value); // Avisamos al padre
    closeDialog();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la categoría.', life: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>