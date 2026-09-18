<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-6xl mx-auto">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button
              icon="pi pi-arrow-left"
              label="Volver"
              class="p-button-outlined p-button-sm"
              @click="goBack"
          />
          <h3 class="text-3xl font-bold text-color m-0">Pagos de la Reserva #{{ bookingId }}</h3>
        </div>
      </div>

      <div v-if="paymentStore.loading" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <pv-data-table
          v-else-if="paymentsList.length"
          :value="paymentsList"
          responsive-layout="scroll"
          class="shadow-2 border-round-xl overflow-hidden"
      >
        <template #header>
          <div class="p-3 surface-card border-bottom-1 surface-border">
            <span class="text-lg font-semibold text-color">Historial de transacciones</span>
          </div>
        </template>

        <pv-column field="id" header="ID" sortable />
        <pv-column field="amount" header="Monto" sortable>
          <template #body="{ data }">
            <span class="font-bold text-900">${{ data.amount?.toFixed(2) || '0.00' }}</span>
          </template>
        </pv-column>
        <pv-column field="paymentMethod" header="Método" /> <pv-column field="status" header="Estado" sortable>
        <template #body="{ data }">
          <pv-tag
              :value="data.status"
              :severity="getStatusSeverity(data.status)"
              rounded
          />
        </template>
      </pv-column>
        <pv-column field="paymentDate" header="Fecha" sortable>
          <template #body="{ data }">
            {{ formatDate(data.paymentDate) }}
          </template>
        </pv-column>
        <pv-column field="transactionId" header="Transacción ID"> <template #body="{ data }">
          <span class="text-sm text-500">{{ data.transactionId || 'N/A' }}</span>
        </template>
        </pv-column>
      </pv-data-table>

      <div v-else class="text-center p-8 surface-card border-round-xl shadow-1">
        <i class="pi pi-credit-card text-500 text-6xl mb-3"></i>
        <p class="text-xl text-color font-medium">No hay pagos registrados para esta reserva</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePaymentStore } from '../../application/payment.store.js';

const props = defineProps({
  bookingId: {
    type: [String, Number],
    required: true
  }
});

const router = useRouter();
const paymentStore = usePaymentStore();

const paymentsList = computed(() => {
  return paymentStore.currentPayment ? [paymentStore.currentPayment] : [];
});

onMounted(async () => {
  await paymentStore.fetchPaymentByBooking(Number(props.bookingId));
});

const goBack = () => {
  router.push({ name: 'guest-booking-detail', params: { bookingId: props.bookingId } });
};

const getStatusSeverity = (status) => {
  const statusMap = {
    'Pending': 'warning',
    'Completed': 'success',
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>