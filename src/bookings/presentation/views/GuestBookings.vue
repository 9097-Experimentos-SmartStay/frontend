<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <pv-button
          icon="pi pi-arrow-left"
          label="Volver"
          class="p-button-outlined p-button-sm"
          @click="goBack"
        />
        <h3 class="text-3xl font-bold text-primary">Mis Reservas</h3>
      </div>
    </div>

    <div v-if="loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem"></i>
      <p class="text-gray-500 mt-2">Cargando reservas...</p>
    </div>

    <pv-data-table
      v-else-if="bookings.length"
      :value="bookings"
      responsive-layout="scroll"
      tableStyle="min-width: 50rem"
      class="shadow-sm rounded-lg overflow-hidden"
    >
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="text-lg font-semibold text-primary">Listado de reservas</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="fetchBookings" />
        </div>
      </template>

      <pv-column field="id" header="ID" sortable />
      <pv-column field="roomId" header="Habitación ID" sortable />
      <pv-column field="guestName" header="Huésped" />
      <pv-column field="guestEmail" header="Email" />
      <pv-column field="checkInDate" header="Check-in" sortable>
        <template #body="{ data }">
          {{ formatDate(data.checkInDate) }}
        </template>
      </pv-column>
      <pv-column field="checkOutDate" header="Check-out" sortable>
        <template #body="{ data }">
          {{ formatDate(data.checkOutDate) }}
        </template>
      </pv-column>
      <pv-column field="status" header="Estado" sortable>
        <template #body="{ data }">
          <pv-tag
            :value="data.status"
            :severity="getStatusSeverity(data.status)"
          />
        </template>
      </pv-column>
      <pv-column header="Acciones">
        <template #body="{ data }">
          <pv-button
            icon="pi pi-eye"
            label="Ver"
            class="p-button-info p-button-sm"
            @click="viewBooking(data.id)"
          />
          <pv-button
            v-if="data.status === 'Pending'"
            icon="pi pi-times"
            label="Cancelar"
            class="p-button-danger p-button-sm ml-2"
            @click="cancelBooking(data.id)"
          />
        </template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
      <i class="pi pi-calendar-times text-gray-400" style="font-size: 3rem"></i>
      <p class="text-gray-500 mt-4">No tienes reservas registradas</p>
      <pv-button
        label="Crear Nueva Reserva"
        icon="pi pi-plus"
        class="p-button-primary mt-4"
        @click="createBooking"
      />
    </div>
  </div>
</template>

<script setup>
import { useBookings } from '../composables/useBookings.js';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const { bookings, loading, error, fetchBookings, cancelBooking: cancelBookingService } = useBookings();

const goBack = () => {
  router.push({ name: 'guest-dashboard' });
};

const viewBooking = (bookingId) => {
  router.push({ name: 'guest-booking-detail', params: { bookingId } });
};

const createBooking = () => {
  router.push({ name: 'guest-create-booking' });
};

const cancelBooking = async (bookingId) => {
  try {
    await cancelBookingService(bookingId);
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Reserva cancelada correctamente',
      life: 3000
    });
    await fetchBookings();
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
    day: 'numeric'
  });
};
</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
</style>

