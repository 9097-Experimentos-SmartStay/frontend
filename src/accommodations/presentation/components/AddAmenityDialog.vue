<template>
  <pv-dialog
      v-model:visible="visible"
      :header="t('masterData.amenity.title')"
      modal
      class="p-fluid"
      :style="{ width: '400px' }"
      :breakpoints="{ '640px': '95vw' }"
  >
    <div class="field">
      <label for="amenity-name" class="font-bold">{{ t('masterData.name') }} *</label>
      <pv-input-text
          id="amenity-name"
          v-model="name"
          :placeholder="t('masterData.amenity.placeholder')"
          autofocus
          :invalid="!!error"
          @keyup.enter="save"
      />
      <small v-if="error" class="p-error">{{ error }}</small>
    </div>

    <template #footer>
      <pv-button :label="t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <pv-button :label="t('common.save')" icon="pi pi-check" :loading="loading" @click="save" />
    </template>
  </pv-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';
import { apiErrorKey } from '@/shared/presentation/utils/api-error.js';

/**
 * Adds a amenity to the master catalog (chain_admin only, §7). Emits the new name.
 */
const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'amenity-added']);
const { t } = useI18n();
const toast = useToast();
const hotelStore = useHotelStore();

const visible = ref(props.modelValue);
const name = ref('');
const error = ref('');
const loading = ref(false);

watch(() => props.modelValue, (value) => {
  visible.value = value;
  if (value) {
    name.value = '';
    error.value = '';
  }
});
watch(visible, (value) => emit('update:modelValue', value));

async function save() {
  const value = name.value.trim();
  error.value = value ? '' : t('validation.required');
  if (!value) return;

  loading.value = true;
  try {
    await hotelStore.createAmenity(value);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('masterData.amenity.created', { name: value }), life: 3000 });
    emit('amenity-added', value);
    visible.value = false;
  } catch (err) {
    error.value = t(apiErrorKey(err, { 409: 'masterData.duplicate', 403: 'masterData.forbidden' }));
  } finally {
    loading.value = false;
  }
}
</script>
