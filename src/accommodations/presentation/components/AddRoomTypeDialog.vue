<template>
  <pv-dialog
      v-model:visible="visible"
      :header="t('roomTypes.newTitle')"
      modal
      class="p-fluid"
      :style="{ width: '450px' }"
      :breakpoints="{ '640px': '95vw' }"
  >
    <div class="field">
      <label for="type-name" class="font-bold">{{ t('masterData.name') }} *</label>
      <pv-input-text id="type-name" v-model="form.name" :placeholder="t('roomTypes.namePlaceholder')" autofocus :invalid="!!errors.name" />
      <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
    </div>

    <div class="field">
      <label for="type-description" class="font-bold">{{ t('staffRooms.description') }} *</label>
      <pv-textarea id="type-description" v-model="form.description" rows="3" :placeholder="t('roomTypes.descriptionPlaceholder')" :invalid="!!errors.description" />
      <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
    </div>

    <pv-message v-if="errorMessage" severity="error">{{ errorMessage }}</pv-message>

    <template #footer>
      <pv-button :label="t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <pv-button :label="t('common.save')" icon="pi pi-check" :loading="loading" @click="save" />
    </template>
  </pv-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { validateRoomTypeForm } from '@/accommodations/domain/room-rules.js';
import { failureMessageKey, violationMessages } from '@/shared/presentation/utils/failure-message.js';

/**
 * US-53 scenario 2: a room type (name and description) of the shared catalog, used to classify rooms.
 * Emits the id of the new type so the room form can select it.
 */
const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'type-added']);
const { t } = useI18n();
const toast = useToast();
const roomStore = useRoomStore();

const visible = ref(props.modelValue);
const form = reactive({ name: '', description: '' });
const errors = ref({});
const errorMessage = ref('');
const loading = ref(false);

watch(() => props.modelValue, (value) => {
  visible.value = value;
  if (value) {
    Object.assign(form, { name: '', description: '' });
    errors.value = {};
    errorMessage.value = '';
  }
});
watch(visible, (value) => emit('update:modelValue', value));

async function save() {
  errorMessage.value = '';
  const violations = validateRoomTypeForm(form);
  errors.value = violationMessages(t, violations, 'staffRooms.rules');
  if (Object.keys(violations).length > 0) return;

  loading.value = true;
  try {
    const created = await roomStore.createRoomType({ name: form.name.trim(), description: form.description.trim() });
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('roomTypes.created', { name: created?.name ?? form.name }), life: 3000 });
    emit('type-added', created?.id);
    visible.value = false;
  } catch (failure) {
    if (failure.hasFieldViolations) errors.value = violationMessages(t, failure.fieldViolations, 'staffRooms.rules');
    else errorMessage.value = t(failureMessageKey(failure));
  } finally {
    loading.value = false;
  }
}
</script>
