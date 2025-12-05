<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-4xl">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" label="Volver" class="p-button-outlined p-button-sm" @click="goBack" />
          <h3 class="text-3xl font-bold text-color m-0">Reserva #{{ bookingId }}</h3>
        </div>
      </div>

      <div v-if="bookingStore.loading" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <pv-card v-else-if="booking" class="surface-card shadow-2 border-round-xl">
        <template #content>
          <div class="grid p-fluid">
            <div class="col-12">
              <div class="flex justify-content-between align-items-center mb-4">
                <span class="text-xl font-bold text-color">Estado de la Reserva</span>
                <pv-tag :value="booking.status" :severity="getStatusSeverity(booking.status)" class="text-lg px-3 py-2" rounded />
              </div>
              <div class="border-top-1 surface-border mb-4"></div>
            </div>

            <div class="col-12 md:col-6 mb-4">
              <span class="text-color-secondary block mb-2 font-medium">Habitación</span>
              <span class="text-2xl font-bold text-primary">#{{ booking.roomId }}</span>
            </div>

            <div class="col-12 md:col-6 mb-4">
              <span class="text-color-secondary block mb-2 font-medium">Huésped Principal</span>
              <span class="text-xl font-bold text-color">{{ booking.guestName }}</span>
              <div class="text-sm text-color-secondary mt-1">{{ booking.guestEmail }}</div>
            </div>

            <div class="col-12 md:col-6 mb-4">
              <span class="text-color-secondary block mb-2 font-medium">Entrada (Check-in)</span>
              <div class="surface-ground p-3 border-round border-1 surface-border flex align-items-center gap-3">
                <i class="pi pi-calendar-plus text-primary text-xl"></i>
                <span class="text-xl font-medium text-color">{{ formatDate(booking.checkInDate) }}</span>
              </div>
            </div>

            <div class="col-12 md:col-6 mb-4">
              <span class="text-color-secondary block mb-2 font-medium">Salida (Check-out)</span>
              <div class="surface-ground p-3 border-round border-1 surface-border flex align-items-center gap-3">
                <i class="pi pi-calendar-minus text-orange-500 text-xl"></i>
                <span class="text-xl font-medium text-color">{{ formatDate(booking.checkOutDate) }}</span>
              </div>
            </div>

            <div class="col-12 flex gap-2 mt-4 pt-4 border-top-1 surface-border">
              <pv-button v-if="booking.status === 'Pending'" label="Cancelar Reserva" icon="pi pi-times" class="p-button-danger p-button-outlined w-auto" @click="cancelBooking" />
              <pv-button
                  v-if="booking.status === 'Pending'"
                  label="Pagar Ahora"
                  icon="pi pi-credit-card"
                  class="p-button-success p-button-outlined"
                  @click="goToPayment"
              />
            </div>
          </div>
        </template>
      </pv-card>

      <div v-else class="text-center p-8 surface-card border-round-xl border-1 surface-border shadow-1">
        <i class="pi pi-search text-500 text-6xl mb-4"></i>
        <p class="text-xl text-color font-medium">No encontramos la reserva solicitada.</p>
        <pv-button label="Volver al listado" class="mt-3 p-button-text" @click="goBack" />
      </div>
    </div>
  </div>
</template>

<script setup>
// ... (El script se mantiene igual)
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useBookingStore } from '../../application/booking.store.js';

const props = defineProps({
  bookingId: { type: [String, Number], required: true }
});

const router = useRouter();
const toast = useToast();
const bookingStore = useBookingStore();
const booking = ref(null);

onMounted(async () => {
  if (bookingStore.bookings.length === 0) {
    await bookingStore.fetchAllBookings();
  }
  booking.value = bookingStore.bookings.find(b => String(b.id) === String(props.bookingId));
});

const goBack = () => router.push({ name: 'guest-bookings' });
const goToPayment = () => {
  router.push({ name: 'guest-payment', params: { bookingId: props.bookingId } });
};

const cancelBooking = async () => {
  try {
    await bookingStore.cancelBooking(Number(props.bookingId));
    toast.add({ severity: 'success', summary: 'Cancelada', life: 3000 });
    booking.value.status = 'Cancelled';
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar', life: 3000 });
  }
};

const getStatusSeverity = (status) => {
  const map = { 'Pending': 'warning', 'Confirmed': 'success', 'Cancelled': 'danger' };
  return map[status] || 'info';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};
</script>