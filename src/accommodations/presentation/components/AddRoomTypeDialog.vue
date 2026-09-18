<template>
  <pv-dialog
      v-model:visible="visible"
      header="Nuevo Tipo de Habitación"
      :modal="true"
      class="p-fluid"
      :style="{ width: '450px' }"
  >
    <div class="field">
      <label for="typeName" class="font-bold">Nombre</label>
      <pv-input-text
          id="typeName"
          v-model="typeName"
          placeholder="Ej. Suite Presidencial, Doble Deluxe..."
          autofocus
          :class="{'p-invalid': submitted && !typeName}"
      />
      <small v-if="submitted && !typeName" class="p-error">El nombre es requerido.</small>
    </div>

    <div class="field">
      <label for="typeDescription" class="font-bold">Descripción</label>
      <pv-textarea
          id="typeDescription"
          v-model="typeDescription"
          rows="3"
          placeholder="Ej. Habitación espaciosa con vista al mar y cama King..."
          :class="{'p-invalid': submitted && !typeDescription}"
      />
      <small v-if="submitted && !typeDescription" class="p-error">La descripción es requerida.</small>
    </div>

    <template #footer>
      <pv-button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="closeDialog" />
      <pv-button label="Guardar" icon="pi pi-check" class="p-button-primary" :loading="loading" @click="saveType" />
    </template>
  </pv-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRoomStore } from '@/accommodations/application/room.store.js';

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'type-added']);

const toast = useToast();
const roomStore = useRoomStore();

const visible = ref(props.modelValue);
const typeName = ref('');
const typeDescription = ref('');
const loading = ref(false);
const submitted = ref(false);

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if(val) { typeName.value = ''; typeDescription.value = ''; submitted.value = false; }
});

watch(visible, (val) => emit('update:modelValue', val));

const closeDialog = () => { visible.value = false; };

const saveType = async () => {
  submitted.value = true;
  if (!typeName.value.trim() || !typeDescription.value.trim()) return;

  loading.value = true;
  try {
    // Payload para el backend (CreateRoomTypeResource)
    const newType = await roomStore.createRoomType({
      name: typeName.value,
      description: typeDescription.value
    });

    toast.add({ severity: 'success', summary: 'Creado', detail: 'Tipo de habitación agregado.', life: 3000 });
    emit('type-added', newType.id); // Devolvemos el ID para seleccionarlo
    closeDialog();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el tipo.', life: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>