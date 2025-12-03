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
        <h3 class="text-3xl font-bold text-primary">Nueva Reserva</h3>
      </div>
    </div>

    <pv-card>
      <template #content>
        <div class="grid">
          <div class="col-12">
            <div class="field">
              <label for="roomId">ID de Habitación *</label>
              <pv-input-number
                id="roomId"
                v-model="form.roomId"
                :min="1"
                class="w-full"
                :disabled="!!roomId"
              />
              <small v-if="roomId">Habitación pre-seleccionada</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="guestName">Nombre del Huésped *</label>
              <pv-input-text id="guestName" v-model="form.guestName" class="w-full" />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="guestEmail">Email del Huésped *</label>
              <pv-input-text id="guestEmail" v-model="form.guestEmail" type="email" class="w-full" />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="checkInDate">Fecha de Check-in *</label>
              <pv-input-text
                id="checkInDate"
                v-model="form.checkInDate"
                type="datetime-local"
                class="w-full"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="checkOutDate">Fecha de Check-out *</label>
              <pv-input-text
                id="checkOutDate"
                v-model="form.checkOutDate"
                type="datetime-local"
                class="w-full"
              />
            </div>
          </div>

          <div class="col-12">
            <pv-button
              label="Crear Reserva"
              icon="pi pi-check"
              class="p-button-primary w-full"
              :loading="loading"
              @click="submitForm"
            />
          </div>
        </div>
      </template>
    </pv-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBookings } from '../composables/useBookings.js';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { loading, error, createBooking } = useBookings();

const roomId = ref(route.params.roomId ? Number(route.params.roomId) : null);

const form = ref({
  roomId: roomId.value || null,
  guestName: '',
  guestEmail: '',
  checkInDate: '',
  checkOutDate: ''
});

const goBack = () => {
  router.push({ name: 'guest-bookings' });
};

const submitForm = async () => {
  if (!form.value.roomId || !form.value.guestName || !form.value.guestEmail || !form.value.checkInDate || !form.value.checkOutDate) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Por favor completa todos los campos',
      life: 3000
    });
    return;
  }

  try {
    await createBooking({
      roomId: form.value.roomId,
      guestName: form.value.guestName,
      guestEmail: form.value.guestEmail,
      checkInDate: form.value.checkInDate,
      checkOutDate: form.value.checkOutDate
    });
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Reserva creada correctamente',
      life: 3000
    });
    router.push({ name: 'guest-bookings' });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al crear la reserva',
      life: 3000
    });
  }
};
</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
</style>

