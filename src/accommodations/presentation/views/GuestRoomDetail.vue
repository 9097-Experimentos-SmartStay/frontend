<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <pv-button
          icon="pi pi-arrow-left"
          label="Volver"
          class="p-button-outlined p-button-sm"
          @click="goBack"
        />
        <h3 class="text-3xl font-bold text-primary">Detalle de Habitación #{{ roomId }}</h3>
      </div>
    </div>

    <div v-if="loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem"></i>
      <p class="text-gray-500 mt-2">Cargando detalles...</p>
    </div>

    <pv-card v-else-if="room">
      <template #content>
        <div class="grid">
          <div class="col-12">
            <h4 class="text-2xl font-bold mb-2">{{ room.roomTypeName || 'Habitación' }}</h4>
          </div>
          <div class="col-12">
            <div class="field">
              <label class="font-semibold">ID de Habitación</label>
              <p>{{ room.id }}</p>
            </div>
          </div>
          <div class="col-12">
            <div class="field">
              <label class="font-semibold">Tipo de Habitación</label>
              <p>{{ room.roomTypeName }} (ID: {{ room.roomTypeId }})</p>
            </div>
          </div>
          <div class="col-12">
            <div class="field">
              <label class="font-semibold">Descripción</label>
              <p>{{ room.description || 'Sin descripción' }}</p>
            </div>
          </div>
          <div class="col-12">
            <div class="field">
              <label class="font-semibold">Amenidades</label>
              <div class="flex flex-wrap gap-2 mt-2">
                <pv-tag
                  v-for="amenity in room.amenities"
                  :key="amenity"
                  :value="amenity"
                  severity="info"
                />
                <span v-if="!room.amenities || room.amenities.length === 0" class="text-gray-500">Sin amenidades</span>
              </div>
            </div>
          </div>
          <div class="col-12">
            <pv-button
              label="Reservar esta Habitación"
              icon="pi pi-calendar-plus"
              class="p-button-primary w-full"
              @click="bookRoom"
            />
          </div>
        </div>
      </template>
    </pv-card>

    <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
      <i class="pi pi-exclamation-triangle text-gray-400" style="font-size: 3rem"></i>
      <p class="text-gray-500 mt-4">No se pudo cargar la habitación</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRooms } from '../composables/useRooms.js';
import { useRouter } from 'vue-router';

const props = defineProps({
  roomId: {
    type: [String, Number],
    required: true
  }
});

const router = useRouter();
const { loading, error, getRoomById } = useRooms();

const room = ref(null);

onMounted(async () => {
  try {
    room.value = await getRoomById(Number(props.roomId));
  } catch (err) {
    console.error('Error loading room:', err);
  }
});

const goBack = () => {
  router.push({ name: 'guest-rooms' });
};

const bookRoom = () => {
  router.push({ name: 'guest-create-booking', params: { roomId: props.roomId } });
};
</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
</style>

