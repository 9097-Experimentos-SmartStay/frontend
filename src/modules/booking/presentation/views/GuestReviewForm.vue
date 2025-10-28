<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Dejar una Reseña</h3>
    <div class="field">
      <label for="bookingSelect">Reserva a reseñar (Ejemplo)</label>
      <pv-select id="bookingSelect" v-model="selectedBookingId" :options="completedBookings" optionLabel="label" optionValue="id" placeholder="Selecciona una reserva completada" class="w-full mb-2" />
    </div>
    <div class="field">
      <label for="rating">Puntuación (1-5)</label>
      <pv-rating id="rating" v-model="rating" :cancel="false" class="mb-2"/>
    </div>
    <div class="field">
      <label for="reviewText">Comentario</label>
      <pv-textarea id="reviewText" v-model="reviewText" placeholder="Escribe tu reseña..." rows="5" class="w-full mb-2" />
    </div>
    <pv-button label="Enviar Reseña" icon="pi pi-send" @click="submitReview" :loading="submitting" :disabled="!selectedBookingId || !rating || !reviewText"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import { BookingService } from '../../application/BookingService.js';
import { BookingApiRepository } from '../../infrastructure/repositories/BookingApiRepository.js';
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js';

const bookingRepository = new BookingApiRepository();
const propertyRepository = new PropertyApiRepository();
const bookingService = new BookingService(bookingRepository, propertyRepository);

const reviewText = ref("");
const rating = ref(null);
const submitting = ref(false);
const guestId = ref(null);
const selectedBookingId = ref(null);
const completedBookings = ref([]);

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    guestId.value = JSON.parse(storedUser).id;
    await loadCompletedBookings();
  } else {
    console.error("GuestReviewForm: No user found!");
  }
});

// TODO: Implement in the db.json the completed bookings filtering
async function loadCompletedBookings() {
  console.log("GuestReviewForm: Loading completed bookings...");
  // En una app real, llamarías a bookingService.getMyBookings y filtrarías por status === 'Completada'
  // Simulación:
  completedBookings.value = [
    { id: 10, label: 'Reserva Hotel Costa del Sol (Completada)'},
    { id: 11, label: 'Reserva Hostal El Valle (Completada)'},
  ];
  console.log("GuestReviewForm: Simulated completed bookings loaded.");
}

async function submitReview() {
  if (!guestId.value || !selectedBookingId.value || !reviewText.value || !rating.value) {
    alert('Por favor, selecciona una reserva, escribe un comentario y da una puntuación.');
    return;
  }
  submitting.value = true;
  console.log(`GuestReviewForm: Submitting review for booking ${selectedBookingId.value}`);
  try {
    await bookingService.submitReview(selectedBookingId.value, guestId.value, reviewText.value, rating.value);
    alert('¡Reseña enviada con éxito!');
    reviewText.value = "";
    rating.value = null;
    selectedBookingId.value = null;
    // If needed, you could redirect or reload something
  } catch (error) {
    console.error("Error submitting review:", error);
    alert(`Error al enviar reseña: ${error.message || 'Intente de nuevo.'}`);
  } finally {
    submitting.value = false;
  }
}
</script>