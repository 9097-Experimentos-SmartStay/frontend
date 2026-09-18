<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" @click="goBack" />
        <div>
          <h1 class="text-2xl font-bold text-color m-0">Control de Reservas</h1>
          <p class="text-color-secondary m-0">Supervisión global de estancias.</p>
        </div>
      </div>
      <div class="flex gap-2">
        <pv-button icon="pi pi-filter" class="p-button-outlined p-button-secondary" v-tooltip="'Filtros Avanzados'" />
        <pv-button icon="pi pi-refresh" class="p-button-outlined" @click="refreshData" />
      </div>
    </div>

    <div class="surface-card p-4 shadow-2 border-round">
      <pv-data-table
          :value="bookingStore.bookings"
          :loading="bookingStore.loading"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          sortField="id"
          :sortOrder="-1"
          class="p-datatable-sm"
      >
        <template #empty>No hay reservas en el sistema.</template>

        <pv-column field="id" header="ID" sortable style="width: 80px"></pv-column>

        <pv-column field="guestName" header="Huésped" sortable>
          <template #body="{ data }">
            <div class="flex flex-column">
              <span class="font-bold text-color">{{ data.guestName }}</span>
              <span class="text-xs text-color-secondary">{{ data.guestEmail }}</span>
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
              <div><i class="pi pi-arrow-right text-green-500 mr-1"></i> {{ formatDate(data.checkInDate) }}</div>
              <div><i class="pi pi-arrow-left text-red-500 mr-1"></i> {{ formatDate(data.checkOutDate) }}</div>
            </div>
          </template>
        </pv-column>

        <pv-column field="status" header="Estado" sortable>
          <template #body="{ data }">
            <pv-tag :value="translateStatus(data.status)" :severity="getStatusSeverity(data.status)" rounded />
          </template>
        </pv-column>

        <pv-column header="Gestión" style="width: 140px">
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
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useBookingStore } from '@/bookings/application/booking.store.js';
// Necesitamos importar la API o agregar el método 'confirm' al store si no existe
import { BookingApi } from '@/bookings/infrastructure/api/booking-api.js';

const router = useRouter();
const toast = useToast();
const bookingStore = useBookingStore();
const bookingApi = new BookingApi(); // Uso directo para confirmación si no está en el store

onMounted(async () => {
  await refreshData();
});

const refreshData = async () => {
  // El store fetchAll trae TODAS las reservas (endpoint del staff)
  await bookingStore.fetchAllBookings();
};

const goBack = () => router.push({ name: 'staff-dashboard' });

const confirmBooking = async (id) => {
  try {
    await bookingApi.confirmBooking(id);
    toast.add({ severity: 'success', summary: 'Confirmada', detail: `Reserva #${id} confirmada exitosamente.` });
    refreshData();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo confirmar.' });
  }
};

const cancelBooking = async (id) => {
  try {
    await bookingStore.cancelBooking(id);
    toast.add({ severity: 'warn', summary: 'Cancelada', detail: `Reserva #${id} cancelada.` });
    refreshData(); // Refrescamos para ver el cambio de estado
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar.' });
  }
};

// --- Helpers ---
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
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};
</script>