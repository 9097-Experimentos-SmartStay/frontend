<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Mis Reservas</h3>
    <div v-if="loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando reservas...</p>
    </div>
    <ul v-else-if="bookings.length">
      <li v-for="b in bookings" :key="b.id" class="mb-2 p-2 border rounded flex justify-between items-center">
        <span>
          Propiedad ID: {{ b.propertyId }} — Check-in: {{ formatDate(b.checkIn) }} — Estado: {{ b.status }}
        </span>
        <pv-button
            v-if="b.status !== 'Cancelada' && b.status !== 'Completada'"
            label="Cancelar"
            icon="pi pi-times-circle"
            class="p-button-sm p-button-danger"
            @click="cancel(b.id)"
            :loading="cancellingBooking === b.id"
        />
      </li>
    </ul>
    <p v-else class="text-center p-4">No tienes reservas activas.</p>
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

const bookings = ref([]);
const loading = ref(true);
const cancellingBooking = ref(null);
const guestId = ref(null);

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    guestId.value = JSON.parse(storedUser).id;
    await loadBookings();
  } else {
    console.error("GuestMyBookings: No user found in localStorage!");
    loading.value = false;
    // If you need, you can redirect to login or show a message here
  }
});

async function loadBookings() {
  if (!guestId.value) return;
  loading.value = true;
  console.log(`GuestMyBookings: Fetching bookings for guest ${guestId.value}`);
  try {
    bookings.value = await bookingService.getMyBookings(guestId.value);
    console.log('GuestMyBookings: Bookings fetched:', bookings.value);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    alert(`Error al cargar reservas: ${error.message || 'Intente de nuevo.'}`);
  } finally {
    loading.value = false;
  }
}

async function cancel(bookingId) {
  if (!guestId.value) return;
  cancellingBooking.value = bookingId;
  console.log(`GuestMyBookings: Cancelling booking ${bookingId}`);
  try {
    await bookingService.cancelMyBooking(bookingId, guestId.value);
    alert(`Reserva ${bookingId} cancelada.`);
    // re load to view updated bookings
    await loadBookings();
  } catch (error) {
    console.error(`Error cancelling booking ${bookingId}:`, error);
    alert(`Error al cancelar: ${error.message || 'Intente de nuevo.'}`);
  } finally {
    cancellingBooking.value = null;
  }
}

// Helper assist function to format dates
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
</script>