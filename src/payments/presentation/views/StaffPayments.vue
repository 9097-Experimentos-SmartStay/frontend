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
        <h3 class="text-3xl font-bold text-primary">Gestión de Pagos</h3>
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
          <span class="text-lg font-semibold text-primary">Todos los pagos</span>
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
      <pv-column header="Acciones">
        <template #body="{ data }">
          <pv-button
            v-if="data.status === 'Pending'"
            icon="pi pi-check"
            label="Procesar"
            class="p-button-success p-button-sm"
            @click="processPayment(data.id)"
          />
          <pv-button
            v-if="data.status === 'Pending'"
            icon="pi pi-times"
            label="Marcar Fallido"
            class="p-button-danger p-button-sm ml-2"
            @click="failPayment(data.id)"
          />
        </template>
      </pv-column>
    </pv-data-table>

    <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
      <i class="pi pi-credit-card text-gray-400" style="font-size: 3rem"></i>
      <p class="text-gray-500 mt-4">No hay pagos registrados</p>
    </div>
  </div>
</template>

<script setup>
import { usePayments } from '../composables/usePayments.js';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const { payments, loading, error, fetchPayments, processPayment: processPaymentService, failPayment: failPaymentService } = usePayments();

const goBack = () => {
  router.push({ name: 'staff-dashboard' });
};

const processPayment = async (paymentId) => {
  try {
    await processPaymentService(paymentId);
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Pago procesado correctamente',
      life: 3000
    });
    await fetchPayments();
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al procesar el pago',
      life: 3000
    });
  }
};

const failPayment = async (paymentId) => {
  try {
    await failPaymentService(paymentId);
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Pago marcado como fallido',
      life: 3000
    });
    await fetchPayments();
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al marcar el pago como fallido',
      life: 3000
    });
  }
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

