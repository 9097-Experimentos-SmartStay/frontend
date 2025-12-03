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
        <h3 class="text-3xl font-bold text-primary">Detalle de Reserva #{{ bookingId }}</h3>
      </div>
    </div>

    <div v-if="loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem"></i>
      <p class="text-gray-500 mt-2">Cargando detalles...</p>
    </div>

    <pv-card v-else-if="booking">
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label class="font-semibold">ID de Reserva</label>
              <p>{{ booking.id }}</p>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="field">
              <label class="font-semibold">ID de Habitación</label>
              <p>{{ booking.roomId }}</p>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="field">
              <label class="font-semibold">Nombre del Huésped</label>
              <p>{{ booking.guestName }}</p>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="field">
              <label class="font-semibold">Email del Huésped</label>
              <p>{{ booking.guestEmail }}</p>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="field">
              <label class="font-semibold">Fecha de Check-in</label>
              <p>{{ formatDate(booking.checkInDate) }}</p>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="field">
              <label class="font-semibold">Fecha de Check-out</label>
              <p>{{ formatDate(booking.checkOutDate) }}</p>
            </div>
          </div>
          <div class="col-12">
            <div class="field">
              <label class="font-semibold">Estado</label>
              <pv-tag
                :value="booking.status"
                :severity="getStatusSeverity(booking.status)"
              />
            </div>
          </div>
          <div class="col-12">
            <pv-button
              label="Ver Pagos"
              icon="pi pi-credit-card"
              class="p-button-primary"
              @click="viewPayments"
            />
            <pv-button
              v-if="booking.status === 'Pending'"
              label="Cancelar Reserva"
              icon="pi pi-times"
              class="p-button-danger ml-2"
              @click="cancelBooking"
            />
          </div>
        </div>
      </template>
    </pv-card>

    <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
      <i class="pi pi-exclamation-triangle text-gray-400" style="font-size: 3rem"></i>
      <p class="text-gray-500 mt-4">No se pudo cargar la reserva</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBookings } from '../composables/useBookings.js';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
  bookingId: {
    type: [String, Number],
    required: true
  }
});

const router = useRouter();
const toast = useToast();
const { loading, error, getBookingById, cancelBooking: cancelBookingService } = useBookings();

const booking = ref(null);

onMounted(async () => {
  try {
    booking.value = await getBookingById(Number(props.bookingId));
  } catch (err) {
    console.error('Error loading booking:', err);
  }
});

const goBack = () => {
  router.push({ name: 'guest-bookings' });
};

const viewPayments = () => {
  router.push({ name: 'guest-payments-by-booking', params: { bookingId: props.bookingId } });
};

const cancelBooking = async () => {
  try {
    await cancelBookingService(Number(props.bookingId));
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Reserva cancelada correctamente',
      life: 3000
    });
    router.push({ name: 'guest-bookings' });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al cancelar la reserva',
      life: 3000
    });
  }
};

const getStatusSeverity = (status) => {
  const statusMap = {
    'Pending': 'warning',
    'Confirmed': 'success',
    'Cancelled': 'danger',
    'Completed': 'info'
  };
  return statusMap[status] || 'secondary';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
</style>

