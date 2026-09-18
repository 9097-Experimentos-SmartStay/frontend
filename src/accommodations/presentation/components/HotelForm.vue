<template>
  <div class="grid p-fluid formgrid">
    <div class="col-12 md:col-8 field">
      <label for="hotel-name" class="font-bold text-color">{{ t('staffHotels.form.name') }} *</label>
      <pv-input-text id="hotel-name" v-model="form.name" :placeholder="t('staffHotels.form.namePlaceholder')" :invalid="!!errors.name" />
      <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
    </div>

    <div class="col-12 md:col-4 field">
      <label for="hotel-type" class="font-bold text-color">{{ t('staffHotels.form.type') }} *</label>
      <div class="p-inputgroup">
        <pv-select v-model="form.type" input-id="hotel-type" :options="categories" :placeholder="t('staffHotels.form.select')" class="w-full" :invalid="!!errors.type" />
        <pv-button v-if="canAddMasterData" icon="pi pi-plus" class="p-button-success" :aria-label="t('staffHotels.form.newCategory')" v-tooltip.top="t('staffHotels.form.newCategory')" @click="emit('add-category')" />
      </div>
      <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
    </div>

    <div class="col-12 md:col-4 field">
      <label for="hotel-country" class="font-bold text-color">{{ t('staffHotels.form.country') }} *</label>
      <pv-input-text id="hotel-country" v-model="form.country" :placeholder="t('staffHotels.form.countryPlaceholder')" :invalid="!!errors.country" />
      <small v-if="errors.country" class="p-error">{{ errors.country }}</small>
    </div>
    <div class="col-12 md:col-4 field">
      <label for="hotel-city" class="font-bold text-color">{{ t('staffHotels.form.city') }} *</label>
      <pv-input-text id="hotel-city" v-model="form.city" :placeholder="t('staffHotels.form.cityPlaceholder')" :invalid="!!errors.city" />
      <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
    </div>
    <div class="col-12 md:col-4 field">
      <label for="hotel-address" class="font-bold text-color">{{ t('staffHotels.form.address') }} *</label>
      <pv-input-text id="hotel-address" v-model="form.address" :placeholder="t('staffHotels.form.addressPlaceholder')" :invalid="!!errors.address" />
      <small v-if="errors.address" class="p-error">{{ errors.address }}</small>
    </div>

    <div class="col-12 field">
      <label for="hotel-description" class="font-bold text-color">{{ t('staffHotels.form.description') }} *</label>
      <pv-textarea id="hotel-description" v-model="form.description" rows="3" :placeholder="t('staffHotels.form.descriptionPlaceholder')" :invalid="!!errors.description" />
      <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
    </div>

    <div class="col-12 field">
      <div class="flex justify-content-between align-items-center mb-2">
        <label class="font-bold text-color block">{{ t('staffHotels.form.image') }} *</label>
        <pv-select-button v-model="imageMode" :options="imageModes" option-label="label" option-value="value" :allow-empty="false" class="p-button-sm" />
      </div>

      <div v-if="imageMode === 'url'" class="p-inputgroup mb-2">
        <span class="p-inputgroup-addon"><i class="pi pi-link"></i></span>
        <pv-input-text v-model="form.imageUrl" placeholder="https://" :invalid="!!errors.imageUrl" />
      </div>
      <div v-else-if="!form.imageUrl" class="border-2 border-dashed surface-border border-round p-5 flex flex-column align-items-center surface-ground">
        <i class="pi pi-cloud-upload text-4xl text-color-secondary mb-3"></i>
        <pv-file-upload mode="basic" name="file" accept="image/*" :max-file-size="1000000" custom-upload auto :choose-label="t('staffHotels.form.chooseFile')" class="p-button-outlined" @uploader="emit('upload', $event.files[0])" />
        <small class="text-color-secondary mt-2">{{ t('staffHotels.form.fileHint') }}</small>
      </div>
      <small v-if="errors.imageUrl" class="p-error block">{{ errors.imageUrl }}</small>

      <div v-if="form.imageUrl" class="relative w-full h-15rem border-round overflow-hidden shadow-1 mt-2">
        <img :src="form.imageUrl" class="w-full h-full object-cover" :alt="t('staffHotels.form.preview')" />
        <pv-button icon="pi pi-times" class="p-button-rounded p-button-danger absolute top-0 right-0 m-2" :aria-label="t('staffHotels.form.removeImage')" @click="form.imageUrl = ''" />
      </div>
    </div>

    <div class="col-12 field">
      <div class="flex align-items-center gap-2 mb-2">
        <label class="font-bold text-color m-0">{{ t('staffHotels.form.amenities') }}</label>
        <pv-button v-if="canAddMasterData" icon="pi pi-plus" class="p-button-rounded p-button-text p-button-sm p-button-success" :aria-label="t('staffHotels.form.newAmenity')" v-tooltip.top="t('staffHotels.form.newAmenity')" @click="emit('add-amenity')" />
      </div>
      <div class="flex gap-3 flex-wrap mt-2">
        <div v-for="option in amenities" :key="option" class="field-checkbox align-items-center">
          <pv-checkbox :input-id="`amenity-${option}`" name="amenity" :value="option" v-model="form.amenities" />
          <label :for="`amenity-${option}`" class="ml-2 text-color-secondary cursor-pointer">{{ option }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Hotel data form shared by "register" and "edit". The parent owns the reactive `form` object.
 * Categories and amenities are master data: only a chain_admin can add new ones (`canAddMasterData`).
 */
const props = defineProps({
  form: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
  amenities: { type: Array, default: () => [] },
  canAddMasterData: { type: Boolean, default: false },
});
const emit = defineEmits(['add-category', 'add-amenity', 'upload']);
const { t } = useI18n();

const imageMode = ref(props.form.imageUrl ? 'url' : 'upload');
const imageModes = computed(() => [
  { value: 'upload', label: t('staffHotels.form.upload') },
  { value: 'url', label: t('staffHotels.form.url') },
]);
</script>
