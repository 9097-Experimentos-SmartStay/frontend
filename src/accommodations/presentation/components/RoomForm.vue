<template>
  <div class="grid p-fluid formgrid">
    <div class="col-12 md:col-6 mb-4">
      <label for="room-hotel" class="font-bold text-color block mb-2">{{ t('staffRooms.form.hotel') }} *</label>
      <pv-select
          v-model="form.hotelId"
          input-id="room-hotel"
          :options="hotels"
          option-label="name"
          option-value="id"
          :placeholder="t('staffRooms.form.hotelPlaceholder')"
          :disabled="hotelLocked"
          :invalid="!!errors.hotelId"
          class="w-full"
      />
      <small v-if="errors.hotelId" class="p-error">{{ errors.hotelId }}</small>
      <small v-else-if="hotelLocked" class="text-color-secondary">{{ t('staffRooms.form.hotelLocked') }}</small>
    </div>

    <div class="col-12 md:col-6 mb-4">
      <label for="room-type" class="font-bold text-color block mb-2">{{ t('staffRooms.form.type') }} *</label>
      <div class="p-inputgroup">
        <pv-select
            v-model="form.roomTypeId"
            input-id="room-type"
            :options="roomTypes"
            option-label="name"
            option-value="id"
            :placeholder="t('staffRooms.form.typePlaceholder')"
            :invalid="!!errors.roomTypeId"
            class="w-full"
        >
          <template #option="{ option }">
            <div class="flex flex-column">
              <span class="font-medium">{{ option.name }}</span>
              <span class="text-color-secondary text-xs">{{ option.description }}</span>
            </div>
          </template>
        </pv-select>
        <pv-button v-if="canAddRoomType" icon="pi pi-plus" class="p-button-success" :aria-label="t('staffRooms.form.newType')" v-tooltip.top="t('staffRooms.form.newType')" @click="emit('add-type')" />
      </div>
      <small v-if="errors.roomTypeId" class="p-error">{{ errors.roomTypeId }}</small>
    </div>

    <div class="col-12 md:col-4 mb-4">
      <label for="room-price" class="font-bold text-color block mb-2">{{ t('staffRooms.pricePerNight') }} *</label>
      <pv-input-number v-model="form.price" input-id="room-price" mode="currency" currency="USD" :locale="locale" :min="0" :invalid="!!errors.price" />
      <small v-if="errors.price" class="p-error">{{ errors.price }}</small>
    </div>

    <div class="col-12 md:col-8 mb-4">
      <label for="room-description" class="font-bold text-color block mb-2">{{ t('staffRooms.description') }} *</label>
      <pv-textarea id="room-description" v-model="form.description" rows="1" auto-resize :placeholder="t('staffRooms.form.descriptionPlaceholder')" :invalid="!!errors.description" />
      <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
    </div>

    <div class="col-12 mb-4">
      <div class="flex align-items-center gap-2 mb-2">
        <label class="font-bold text-color m-0">{{ t('staffHotels.form.amenities') }}</label>
        <pv-button v-if="canAddAmenity" icon="pi pi-plus" class="p-button-rounded p-button-text p-button-sm p-button-success" :aria-label="t('staffHotels.form.newAmenity')" v-tooltip.top="t('staffHotels.form.newAmenity')" @click="emit('add-amenity')" />
      </div>
      <div class="flex gap-3 flex-wrap">
        <div v-for="option in amenities" :key="option" class="field-checkbox">
          <pv-checkbox :input-id="`room-${option}`" name="roomAmenity" :value="option" v-model="form.amenities" />
          <label :for="`room-${option}`" class="ml-2 text-color-secondary cursor-pointer">{{ option }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

/**
 * Room data form shared by "new room" and "edit room". The parent owns the reactive `form`.
 * `hotelLocked`: PUT /rooms cannot move a room to another hotel.
 */
defineProps({
  form: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  hotels: { type: Array, default: () => [] },
  roomTypes: { type: Array, default: () => [] },
  amenities: { type: Array, default: () => [] },
  hotelLocked: { type: Boolean, default: false },
  canAddRoomType: { type: Boolean, default: false },
  canAddAmenity: { type: Boolean, default: false },
});
const emit = defineEmits(['add-type', 'add-amenity']);
const { t, locale } = useI18n();
</script>
