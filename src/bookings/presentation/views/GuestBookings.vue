<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="flex justify-content-between align-items-center mb-6">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" label="Volver" class="p-button-outlined p-button-sm" @click="goBack" />
        <h3 class="text-3xl font-bold text-color m-0">Mis Reservas</h3>
      </div>
    </div>

    <div v-if="bookingStore.loading" class="flex flex-column align-items-center justify-content-center h-20rem">
      <pv-progress-spinner />
      <p class="text-color-secondary mt-3">Cargando reservas...</p>
    </div>

    <pv-data-table
        v-else-if="bookingStore.bookings.length"
        :value="bookingStore.bookings"
        responsive-layout="scroll"
        class="shadow-2 border-round-xl overflow-hidden"
        paginator :rows="5"
        tableStyle="min-width: 50rem"
    >
      <template #header>
        <div class="flex align-items-center justify-content-between p-3 surface-card border-bottom-1 surface-border">
          <span class="text-xl font-bold text-color">Historial de Viajes</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="fetchData" v-tooltip="'Refrescar'" />
        </div>
      </template>

      <pv-column field="id" header="ID" sortable style="width: 10%"></pv-column>
      <pv-column field="roomId" header="Habitación" sortable style="width: 15%"></pv-column>

      <pv-column header="Fechas" style="width: 30%">
        <template #body="{ data }">
          <div class="flex flex-column">
            <span class="font-medium text-color">{{ formatDate(data.checkInDate) }}</span>
            <span class="text-color-secondary text-sm">hasta {{ formatDate(data.checkOutDate) }}</span>
          </div>
        </template>
      </pv-column>

      <pv-column field="status" header="Estado" sortable style="width: 15%">
        <template #body="{ data }">
          <pv-tag :value="translateStatus(data.status)" :severity="getStatusSeverity(data.status)" rounded />
        </template>
      </pv-column>

      <pv-column header="Acciones" style="width: 30%">
        <template #body="{ data }">
          <div class="flex gap-2">
            <pv-button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-info" @click="viewBooking(data.id)" v-tooltip="'Ver Detalles'" />
            <pv-button
                v-if="data.status === 'Pending'"
                icon="pi pi-times"
                class="p-button-rounded p-button-text p-button-danger"
                @click="cancelBooking(data.id)"
                v-tooltip="'Cancelar Reserva'"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 surface-card border-round-xl shadow-1 border-1 surface-border">
      <div class="surface-ground border-circle w-6rem h-6rem flex align-items-center justify-content-center mx-auto mb-4">
        <i class="pi pi-calendar-times text-500 text-5xl"></i>
      </div>
      <h3 class="text-color font-bold m-0 mb-2">No tienes reservas activas</h3>
      <p class="text-color-secondary mb-4">¿Planeando tu próxima escapada?</p>
      <pv-button label="Explorar Habitaciones" icon="pi pi-search" class="p-button-primary" @click="createBooking" />
    </div>
  </div>
</template>

<script setup>
// ... (El script se mantiene igual que la versión anterior)
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

const goBack = () => router.push({ name: 'guest-dashboard' });
const viewBooking = (bookingId) => router.push({ name: 'guest-booking-detail', params: { bookingId } });
const createBooking = () => router.push({ name: 'guest-rooms' });

const cancelBooking = async (bookingId) => {
  try {
    await bookingStore.cancelBooking(bookingId);
    toast.add({ severity: 'success', summary: 'Cancelada', detail: 'Reserva cancelada correctamente', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar', life: 3000 });
  }
};

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