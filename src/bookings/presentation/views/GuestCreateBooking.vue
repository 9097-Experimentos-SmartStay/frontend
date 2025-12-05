<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-4xl">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" label="Volver" class="p-button-outlined p-button-sm" @click="goBack" />
          <h3 class="text-3xl font-bold text-color m-0">Confirmar Reserva</h3>
        </div>
      </div>

      <pv-card class="surface-card shadow-2 border-round-xl">
        <template #content>
          <div class="grid p-fluid">
            <div class="col-12 mb-4">
              <label class="block font-bold mb-2 text-color">Habitación Seleccionada</label>
              <div class="surface-ground p-4 border-round-xl border-1 surface-border flex align-items-center gap-3">
                <i class="pi pi-key text-primary text-2xl"></i>
                <div class="flex flex-column">
                  <span class="text-sm text-color-secondary">ID de Habitación</span>
                  <span class="text-2xl font-bold text-color">{{ form.roomId || 'No seleccionada' }}</span>
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="guestName" class="font-medium text-color">Nombre del Huésped</label>
                <pv-input-text id="guestName" v-model="form.guestName" class="w-full" />
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="guestEmail" class="font-medium text-color">Email de Contacto</label>
                <pv-input-text id="guestEmail" v-model="form.guestEmail" class="w-full" disabled />
                <small class="text-color-secondary">Vinculado a tu cuenta</small>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="checkInDate" class="font-medium text-color">Llegada</label>
                <pv-input-text id="checkInDate" v-model="form.checkInDate" type="datetime-local" class="w-full" />
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="checkOutDate" class="font-medium text-color">Salida</label>
                <pv-input-text id="checkOutDate" v-model="form.checkOutDate" type="datetime-local" class="w-full" />
              </div>
            </div>

            <div class="col-12 mt-5">
              <pv-button label="Confirmar y Reservar" icon="pi pi-check" class="p-button-primary w-full p-button-lg font-bold" :loading="bookingStore.loading" @click="submitForm" />
            </div>
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script setup>
// ... (El script se mantiene igual)
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useBookingStore } from '../../application/booking.store.js';
import useIamStore from '@/iam/application/iam.store.js';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const bookingStore = useBookingStore();
const iamStore = useIamStore();

const form = ref({
  roomId: route.params.roomId ? Number(route.params.roomId) : null,
  guestName: '',
  guestEmail: '',
  checkInDate: '',
  checkOutDate: ''
});

onMounted(() => {
  const user = iamStore.users.find(u => u.id === iamStore.currentUserId);
  if (user) {
    form.value.guestName = user.username.split('@')[0];
    form.value.guestEmail = user.username;
  }
});

const goBack = () => router.push({ name: 'guest-rooms' });

const submitForm = async () => {
  if (!form.value.roomId || !form.value.checkInDate || !form.value.checkOutDate) {
    toast.add({ severity: 'warn', summary: 'Faltan datos', detail: 'Revisa las fechas y la habitación.', life: 3000 });
    return;
  }

  try {
    const payload = {
      roomId: form.value.roomId,
      guestName: form.value.guestName,
      guestEmail: form.value.guestEmail,
      checkInDate: new Date(form.value.checkInDate).toISOString(),
      checkOutDate: new Date(form.value.checkOutDate).toISOString()
    };

    await bookingStore.createBooking(payload);

    toast.add({ severity: 'success', summary: '¡Reserva Creada!', detail: 'Nos vemos pronto.', life: 3000 });
    router.push({ name: 'guest-bookings' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la reserva.', life: 3000 });
  }
};
</script>