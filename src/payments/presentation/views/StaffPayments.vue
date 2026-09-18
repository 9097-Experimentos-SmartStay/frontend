<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="flex justify-content-between align-items-center mb-6">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" label="Volver" class="p-button-outlined p-button-sm" @click="goBack" />
        <h3 class="text-3xl font-bold text-color m-0">Gestión de Pagos</h3>
      </div>
    </div>

    <div v-if="paymentStore.loading" class="flex justify-content-center p-8">
      <pv-progress-spinner />
    </div>

    <pv-data-table
        v-else-if="allPayments && allPayments.length > 0"
        :value="allPayments"
        responsive-layout="scroll"
        class="shadow-2 border-round-xl overflow-hidden"
        paginator :rows="10"
    >
      <template #header>
        <div class="flex align-items-center justify-content-between p-3 surface-card border-bottom-1 surface-border">
          <span class="text-xl font-bold text-color">Todos los pagos</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="fetchPayments" v-tooltip="'Refrescar'" />
        </div>
      </template>

      <pv-column field="id" header="ID" sortable style="width: 80px"></pv-column>
      <pv-column field="bookingId" header="Reserva ID" sortable></pv-column>

      <pv-column field="amount" header="Monto" sortable>
        <template #body="{ data }">
          <span class="font-medium text-color">${{ data.amount?.toFixed(2) || '0.00' }}</span>
        </template>
      </pv-column>

      <pv-column field="paymentMethod" header="Método"></pv-column>

      <pv-column field="status" header="Estado" sortable>
        <template #body="{ data }">
          <pv-tag :value="translateStatus(data.status)" :severity="getStatusSeverity(data.status)" rounded />
        </template>
      </pv-column>

      <pv-column field="paymentDate" header="Fecha" sortable>
        <template #body="{ data }">
          {{ formatDate(data.paymentDate) }}
        </template>
      </pv-column>

      <pv-column header="Acciones" style="width: 180px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <pv-button
                v-if="data.status === 'Pending'"
                icon="pi pi-check"
                class="p-button-rounded p-button-success p-button-text"
                v-tooltip="'Aprobar Manualmente'"
            />
            <pv-button
                v-if="data.status === 'Pending'"
                icon="pi pi-times"
                class="p-button-rounded p-button-danger p-button-text"
                v-tooltip="'Rechazar'"
            />
            <pv-button
                icon="pi pi-eye"
                class="p-button-rounded p-button-info p-button-text"
                v-tooltip="'Ver Detalle'"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 surface-card border-round-xl border-1 surface-border shadow-1">
      <i class="pi pi-wallet text-500 text-6xl mb-4"></i>
      <h3 class="text-color font-bold m-0 mb-2">No hay pagos registrados</h3>
      <p class="text-color-secondary">Las transacciones aparecerán aquí.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
// IMPORTAMOS EL STORE CORRECTO
import { usePaymentStore } from '../../application/payment.store.js';
// Si necesitas una lista de TODOS los pagos, tu store debe tener una acción `fetchAllPayments`.
// Si no la tiene, usa la API directa temporalmente o crea la acción en el store.
// Asumiremos que solo tenemos `fetchPaymentByBooking` por ahora, por lo que esta vista
// necesitaría un endpoint de `getAllPayments` en el backend.

const router = useRouter();
const toast = useToast();
const paymentStore = usePaymentStore();

// Mock de lista por si el store no tiene getAllPayments aun
const allPayments = ref([]);

const fetchPayments = async () => {
  // TODO: Implement fetchAllPayments in Store and API
  // await paymentStore.fetchAllPayments();
  // allPayments.value = paymentStore.payments;

  // Mock temporal para que compile y veas la UI
  allPayments.value = [];
};

onMounted(() => {
  fetchPayments();
});

const goBack = () => router.push({ name: 'staff-dashboard' });

// Helpers
const getStatusSeverity = (status) => {
  const map = { 'Pending': 'warning', 'Completed': 'success', 'Failed': 'danger' };
  return map[status] || 'info';
};

const translateStatus = (status) => {
  const map = { 'Pending': 'Pendiente', 'Completed': 'Completado', 'Failed': 'Fallido' };
  return map[status] || status;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};
</script>