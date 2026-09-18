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
import { reportError } from '@/shared/infrastructure/logging/report-error.js';
/**
 * @file GuestPayment.vue
 * @description View component for handling guest payments within the Booking Context.
 * Orchestrates the interaction between Payment, Booking, and Accommodation contexts.
 */

import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// --- Domain Stores (Application Layer) ---
import { usePaymentStore } from '../../application/payment.store.js';
import { useBookingStore } from '@/bookings/application/booking.store.js';
import { useRoomStore } from '@/accommodations/application/room.store.js';
// import { useHotelStore } from '@/accommodations/application/hotel.store.js'; // Future integration for dynamic pricing

// --- Composables & Routing ---
const router = useRouter();
const route = useRoute();
const toast = useToast();

// --- Store Instantiation ---
const paymentStore = usePaymentStore();
const bookingStore = useBookingStore();
const roomStore = useRoomStore();
// const hotelStore = useHotelStore();

// --- Local State ---
/** @type {number} Unique identifier for the booking derived from route parameters. */
const bookingId = Number(route.params.bookingId);

/** @type {import('vue').Ref<boolean>} Flag indicating if initial data is being loaded. */
const loadingData = ref(true);

/** @type {import('vue').Ref<Object|null>} The booking domain entity. */
const booking = ref(null);

/** @type {import('vue').Ref<Object|null>} The room domain entity associated with the booking. */
const room = ref(null);

/** @type {import('vue').Ref<number>} Base price per night (Mocked pending Hotel Context integration). */
const roomPrice = ref(100);

/**
 * Reactive state for the credit card form data.
 * This structure maps to the payment processing command requirements.
 */
const paymentForm = ref({
  cardHolderName: '',
  cardNumber: '',
  expirationDate: '',
  cvv: ''
});

// --- Computed Properties ---

/**
 * Calculates the total number of nights for the booking.
 * Derived from CheckInDate and CheckOutDate.
 * @returns {number} The total nights (minimum 1).
 */
const nightsCount = computed(() => {
  if (!booking.value) return 0;
  const start = new Date(booking.value.checkInDate);
  const end = new Date(booking.value.checkOutDate);
  // Calculate difference in milliseconds and convert to days
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
});

/**
 * Calculates the total amount to be charged.
 * @returns {string} The total amount formatted to 2 decimal places.
 */
const totalAmount = computed(() => {
  return (nightsCount.value * roomPrice.value).toFixed(2);
});

// --- Lifecycle Hooks ---

/**
 * Initializes the component by fetching necessary aggregates.
 * 1. Checks if payment already exists.
 * 2. Retrieves the Booking aggregate.
 * 3. Retrieves the Room aggregate.
 */
onMounted(async () => {
  try {
    // 1. Check payment status via Payment Context
    await paymentStore.fetchPaymentByBooking(bookingId);

    // If the Payment Aggregate exists and is completed, redirect to detail view
    if (paymentStore.currentPayment && paymentStore.currentPayment.status === 'Completed') {
      toast.add({ severity: 'info', summary: 'Payment Completed', detail: 'This booking has already been paid.' });
      router.push({ name: 'guest-booking-detail', params: { bookingId } });
      return;
    }

    // 2. Load Booking Aggregate via Booking Context
    // If the local store is empty (page reload), force a fetch from the Infrastructure
    if (bookingStore.bookings.length === 0) {
      await bookingStore.fetchAllBookings();
    }

    // Find the specific booking entity in the state
    booking.value = bookingStore.bookings.find(b => String(b.id) === String(bookingId));

    if (!booking.value) {
      throw new Error("Booking entity not found in current state.");
    }

    // 3. Load Room Aggregate via Accommodation Context
    // Required to display room type and details in the summary
    await roomStore.fetchRoomById(booking.value.roomId);
    room.value = roomStore.currentRoom;

    // 4. (Future) Load Hotel Aggregate for dynamic pricing logic
    // roomPrice.value = hotelStore.getRateForRoom(room.value.roomTypeId);

  } catch (err) {
    reportError('Error initializing payment view', err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load payment details.' });
    goBack();
  } finally {
    loadingData.value = false;
  }
});

// --- Actions ---

/**
 * Navigates back to the booking detail view.
 */
const goBack = () => router.push({ name: 'guest-booking-detail', params: { bookingId } });

/**
 * Handles the payment submission process.
 * Validates inputs, creates the payment command, and orchestrates state updates.
 */
const submitPayment = async () => {
  // Domain Validation (Simple Client-Side Check)
  if (!paymentForm.value.cardNumber || !paymentForm.value.cardHolderName || !paymentForm.value.cvv) {
    toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please complete all payment fields.', life: 3000 });
    return;
  }

  try {
    // Sanitize Input: Remove formatting characters from card number
    const cleanCardNumber = paymentForm.value.cardNumber.replace(/-/g, '');

    // Construct the Command Payload
    // This matches the ProcessPaymentResource expected by the API
    const payload = {
      bookingId: Number(bookingId),
      amount: Number(totalAmount.value),
      paymentMethod: 'Credit Card',
      cardNumber: cleanCardNumber,
      cardHolderName: paymentForm.value.cardHolderName,
      expirationDate: paymentForm.value.expirationDate,
      cvv: paymentForm.value.cvv
    };

    // Execute Application Service (Store Action)
    await paymentStore.processPayment(payload);

    toast.add({ severity: 'success', summary: 'Payment Successful', detail: 'Your booking has been confirmed.', life: 3000 });

    // --- STATE SYNCHRONIZATION STRATEGY ---

    // 1. Optimistic UI Update: Update local state for immediate feedback if needed
    if (booking.value) {
      booking.value.status = 'Confirmed';
    }

    // 2. Cache Invalidation: Force a refresh of the Booking Store.
    // This ensures that when the user navigates back to the list or detail view,
    // they see the updated status ('Confirmed') directly from the Source of Truth (Backend).
    await bookingStore.fetchAllBookings();

    // 3. Navigation
    setTimeout(() => {
      router.push({ name: 'guest-booking-detail', params: { bookingId } });
    }, 1500);

  } catch (err) {
    reportError('Payment processing failed', err);
    toast.add({ severity: 'error', summary: 'Payment Declined', detail: 'Please check your card details or balance.', life: 4000 });
  }
};
</script>