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
        <h3 class="text-3xl font-bold text-primary">Mis Pagos</h3>
      </div>
    </div>

    <div v-if="loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem"></i>
      <p class="text-gray-500 mt-2">Cargando pagos...</p>
    </div>

    <pv-data-table
      v-else-if="payments.length"
      :value="payments"
      responsive-layout="scroll"
      tableStyle="min-width: 50rem"
      class="shadow-sm rounded-lg overflow-hidden"
    >
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="text-lg font-semibold text-primary">Listado de pagos</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="fetchPayments" />
        </div>
      </template>

      <pv-column field="id" header="ID" sortable />
      <pv-column field="bookingId" header="Reserva ID" sortable />
      <pv-column field="amount" header="Monto" sortable>
        <template #body="{ data }">
          ${{ data.amount?.toFixed(2) || '0.00' }}
        </template>
      </pv-column>
      <pv-column field="paymentMethod" header="Método de Pago" />
      <pv-column field="status" header="Estado" sortable>
        <template #body="{ data }">
          <pv-tag
            :value="data.status"
            :severity="getStatusSeverity(data.status)"
          />
        </template>
      </pv-column>
      <pv-column field="paymentDate" header="Fecha de Pago" sortable>
        <template #body="{ data }">
          {{ formatDate(data.paymentDate) }}
        </template>
      </pv-column>
      <pv-column field="invoiceNumber" header="N° Factura">
        <template #body="{ data }">
          {{ data.invoiceNumber || 'N/A' }}
        </template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
      <i class="pi pi-credit-card text-gray-400" style="font-size: 3rem"></i>
      <p class="text-gray-500 mt-4">No tienes pagos registrados</p>
    </div>
  </div>
</template>

<script setup>
import { usePayments } from '../composables/usePayments.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const { payments, loading, error, fetchPayments } = usePayments();

const goBack = () => {
  router.push({ name: 'guest-dashboard' });
};

const getStatusSeverity = (status) => {
  const statusMap = {
    'Pending': 'warning',
    'Processed': 'success',
    'Failed': 'danger',
    'Refunded': 'info'
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

