<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="flex justify-content-between align-items-center mb-6">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" label="Volver" class="p-button-outlined p-button-sm" @click="goBack" />
        <h3 class="text-3xl font-bold text-color m-0">Gestión de Reservas</h3>
      </div>
    </div>

    <div v-if="bookingStore.loading" class="flex justify-content-center p-8">
      <pv-progress-spinner />
    </div>

    <pv-data-table
        v-else-if="bookingStore.bookings.length"
        :value="bookingStore.bookings"
        responsive-layout="scroll"
        class="shadow-2 border-round-xl overflow-hidden"
        paginator :rows="10"
    >
      <template #header>
        <div class="flex align-items-center justify-content-between p-3 surface-card border-bottom-1 surface-border">
          <span class="text-xl font-bold text-color">Todas las reservas</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="fetchData" v-tooltip="'Refrescar'" />
        </div>
      </template>

      <pv-column field="id" header="ID" sortable style="width: 80px"></pv-column>

      <pv-column field="guestName" header="Huésped" sortable>
        <template #body="{ data }">
          <div class="flex flex-column">
            <span class="font-bold text-color">{{ data.guestName }}</span>
            <span class="text-sm text-color-secondary">{{ data.guestEmail }}</span>
          </div>
        </template>
      </pv-column>

      <pv-column field="roomId" header="Habitación" sortable>
        <template #body="{ data }">
          <span class="text-primary font-medium">#{{ data.roomId }}</span>
        </template>
      </pv-column>

      <pv-column header="Fechas" sortable field="checkInDate">
        <template #body="{ data }">
          <div class="text-sm">
            <div class="text-color"><i class="pi pi-calendar-plus text-green-500 mr-2"></i>{{ formatDate(data.checkInDate) }}</div>
            <div class="text-color"><i class="pi pi-calendar-minus text-red-500 mr-2"></i>{{ formatDate(data.checkOutDate) }}</div>
          </div>
        </template>
      </pv-column>

      <pv-column field="status" header="Estado" sortable>
        <template #body="{ data }">
          <pv-tag :value="translateStatus(data.status)" :severity="getStatusSeverity(data.status)" rounded />
        </template>
      </pv-column>

      <pv-column header="Acciones" style="width: 160px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <pv-button
                v-if="data.status === 'Pending'"
                icon="pi pi-check"
                class="p-button-rounded p-button-success p-button-text"
                v-tooltip="'Confirmar Manualmente'"
                @click="confirmBooking(data.id)"
            />
            <pv-button
                v-if="data.status !== 'Cancelled' && data.status !== 'Completed'"
                icon="pi pi-times"
                class="p-button-rounded p-button-danger p-button-text"
                v-tooltip="'Cancelar Reserva'"
                @click="cancelBooking(data.id)"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 surface-card border-round-xl border-1 surface-border shadow-1">
      <i class="pi pi-calendar-times text-500 text-6xl mb-4"></i>
      <h3 class="text-color font-bold m-0 mb-2">No hay reservas registradas</h3>
      <p class="text-color-secondary">El sistema está esperando nuevos huéspedes.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useBookingStore } from '../../application/booking.store.js';

const router = useRouter();
const toast = useToast();
const bookingStore = useBookingStore();

const fetchData = async () => {
  await bookingStore.fetchAllBookings();
};

onMounted(() => {
  fetchData();
});

const goBack = () => {
  router.push({ name: 'staff-dashboard' });
};

const confirmBooking = async (bookingId) => {
  try {
    await bookingStore.confirmBooking(bookingId);

    toast.add({ severity: 'success', summary: 'Confirmada', detail: 'Reserva confirmada exitosamente.', life: 3000 });
    await fetchData(); // Recargamos para ver el cambio
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo confirmar la reserva.', life: 3000 });
  }
};

const cancelBooking = async (bookingId) => {
  try {
    await bookingStore.cancelBooking(bookingId);
    toast.add({ severity: 'success', summary: 'Cancelada', detail: 'Reserva cancelada correctamente.', life: 3000 });
    // No hace falta recargar, el store actualiza localmente
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar la reserva.', life: 3000 });
  }
};

// Helpers
const getStatusSeverity = (status) => {
  const map = { 'Pending': 'warning', 'Confirmed': 'success', 'Cancelled': 'danger' };
  return map[status] || 'info';
};

const translateStatus = (status) => {
  const map = { 'Pending': 'Pendiente', 'Confirmed': 'Confirmada', 'Cancelled': 'Cancelada' };
  return map[status] || status;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};
</script>