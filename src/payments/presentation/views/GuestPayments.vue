<template>
  <div class="surface-ground min-h-screen p-4 md:p-6 flex flex-column align-items-center">
    <pv-toast position="bottom-right" />

    <div class="w-full max-w-6xl">
      <div class="flex justify-content-between align-items-center mb-6">
        <div class="flex align-items-center gap-3">
          <pv-button icon="pi pi-arrow-left" label="Volver" class="p-button-outlined p-button-sm" @click="goBack" />
          <h3 class="text-3xl font-bold text-color m-0">Pasarela de Pago</h3>
        </div>
      </div>

      <div v-if="loadingData" class="flex justify-content-center p-8">
        <pv-progress-spinner />
      </div>

      <div v-else class="grid">

        <div class="col-12 lg:col-7">
          <pv-card class="surface-card shadow-2 border-round-xl h-full">
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <span class="text-xl font-bold text-color">Método de Pago</span>
                <div class="flex gap-2">
                  <i class="pi pi-credit-card text-2xl text-primary"></i>
                  <i class="pi pi-lock text-2xl text-green-500" v-tooltip="'Encriptación SSL Segura'"></i>
                </div>
              </div>
            </template>
            <template #content>
              <div class="p-fluid grid formgrid mt-2">

                <div class="col-12 mb-4">
                  <label class="font-medium text-color mb-2 block">Titular de la Tarjeta</label>
                  <pv-input-text v-model="paymentForm.cardHolderName" placeholder="Como aparece en la tarjeta" />
                </div>

                <div class="col-12 mb-4">
                  <label class="font-medium text-color mb-2 block">Número de Tarjeta</label>
                  <pv-input-mask v-model="paymentForm.cardNumber" mask="9999-9999-9999-9999" placeholder="0000-0000-0000-0000" />
                </div>

                <div class="col-6 mb-4">
                  <label class="font-medium text-color mb-2 block">Expiración (MM/YY)</label>
                  <pv-input-mask v-model="paymentForm.expirationDate" mask="99/99" placeholder="MM/YY" />
                </div>

                <div class="col-6 mb-4">
                  <label class="font-medium text-color mb-2 block">CVV</label>
                  <pv-input-mask v-model="paymentForm.cvv" mask="999" placeholder="123" />
                </div>

                <div class="col-12 mt-3">
                  <pv-button
                      label="Pagar Ahora"
                      icon="pi pi-check-circle"
                      class="w-full p-button-lg font-bold"
                      :loading="paymentStore.loading"
                      @click="submitPayment"
                  />
                  <p class="text-xs text-color-secondary text-center mt-3">
                    <i class="pi pi-info-circle"></i> Al hacer clic en "Pagar Ahora", aceptas nuestros términos y condiciones.
                    Se simulará un cargo a tu tarjeta.
                  </p>
                </div>

              </div>
            </template>
          </pv-card>
        </div>

        <div class="col-12 lg:col-5">
          <div class="surface-card shadow-2 border-round-xl p-4 sticky top-0" style="top: 2rem">
            <h3 class="text-xl font-bold text-color mb-4 border-bottom-1 surface-border pb-3">Resumen de Reserva</h3>

            <div class="flex justify-content-between mb-3">
              <span class="text-color-secondary">Reserva ID</span>
              <span class="font-medium text-color">#{{ bookingId }}</span>
            </div>

            <div class="flex justify-content-between mb-3" v-if="room">
              <span class="text-color-secondary">Habitación</span>
              <span class="font-medium text-color">{{ room.roomTypeName }}</span>
            </div>

            <div class="flex justify-content-between mb-3">
              <span class="text-color-secondary">Noches</span>
              <span class="font-medium text-color">{{ nightsCount }} noches</span>
            </div>

            <div class="flex justify-content-between mb-3">
              <span class="text-color-secondary">Precio por noche</span>
              <span class="font-medium text-color">${{ roomPrice }}</span>
            </div>

            <div class="border-top-1 surface-border my-3"></div>

            <div class="flex justify-content-between align-items-center">
              <span class="text-xl font-bold text-color">Total a Pagar</span>
              <span class="text-2xl font-bold text-primary">${{ totalAmount }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Stores
import { usePaymentStore } from '../../application/payment.store.js';
import { useBookingStore } from '@/bookings/application/booking.store.js';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { useHotelStore } from '@/accommodations/application/hotel.store.js';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const paymentStore = usePaymentStore();
const bookingStore = useBookingStore();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();

const bookingId = route.params.bookingId;
const loadingData = ref(true);
const booking = ref(null);
const room = ref(null);
const roomPrice = ref(100); // Precio base default si no se encuentra

const paymentForm = ref({
  cardHolderName: '',
  cardNumber: '',
  expirationDate: '',
  cvv: ''
});

// --- Cálculos ---
const nightsCount = computed(() => {
  if (!booking.value) return 0;
  const start = new Date(booking.value.checkInDate);
  const end = new Date(booking.value.checkOutDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
});

const totalAmount = computed(() => {
  return (nightsCount.value * roomPrice.value).toFixed(2);
});

// --- Lifecycle ---
onMounted(async () => {
  try {
    // 1. Verificar si ya se pagó
    await paymentStore.fetchPaymentByBooking(bookingId);
    if (paymentStore.currentPayment && paymentStore.currentPayment.status === 'Completed') {
      toast.add({ severity: 'info', summary: 'Pagado', detail: 'Esta reserva ya está pagada.' });
      router.push({ name: 'guest-booking-detail', params: { bookingId } });
      return;
    }

    // 2. Cargar Reserva
    if (bookingStore.bookings.length === 0) await bookingStore.fetchAllBookings();
    booking.value = bookingStore.bookings.find(b => String(b.id) === String(bookingId));

    if (!booking.value) throw new Error("Reserva no encontrada");

    // 3. Cargar Habitación (para saber el tipo)
    await roomStore.fetchRoomById(booking.value.roomId);
    room.value = roomStore.currentRoom;

    // 4. (Opcional) Obtener precio real del Hotel
    // Como en tu modelo Room no tiene precio, asumimos un precio base por ahora
    // O buscamos el Hotel si tuvieramos la relación.
    // roomPrice.value = 150; // Mock price

  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los detalles del pago.' });
    goBack();
  } finally {
    loadingData.value = false;
  }
});

const goBack = () => router.push({ name: 'guest-booking-detail', params: { bookingId } });

const submitPayment = async () => {
  // Validaciones simples
  if (!paymentForm.value.cardNumber || !paymentForm.value.cardHolderName || !paymentForm.value.cvv) {
    toast.add({ severity: 'warn', summary: 'Faltan datos', detail: 'Por favor complete el formulario.', life: 3000 });
    return;
  }

  try {
    // Limpiar máscara del número de tarjeta para enviar solo dígitos
    const cleanCardNumber = paymentForm.value.cardNumber.replace(/-/g, '');

    const payload = {
      bookingId: Number(bookingId),
      amount: Number(totalAmount.value),
      paymentMethod: 'Credit Card',
      cardNumber: cleanCardNumber,
      cardHolderName: paymentForm.value.cardHolderName,
      expirationDate: paymentForm.value.expirationDate,
      cvv: paymentForm.value.cvv
    };

    await paymentStore.processPayment(payload);

    toast.add({ severity: 'success', summary: '¡Pago Exitoso!', detail: 'Tu reserva ha sido confirmada.', life: 3000 });

    // Actualizar estado de la reserva visualmente
    if (booking.value) booking.value.status = 'Confirmed';

    // Redirigir tras breve pausa
    setTimeout(() => {
      router.push({ name: 'guest-booking-detail', params: { bookingId } });
    }, 1500);

  } catch (err) {
    toast.add({ severity: 'error', summary: 'Pago Rechazado', detail: 'Verifica los fondos o datos de la tarjeta.', life: 4000 });
  }
};
</script>