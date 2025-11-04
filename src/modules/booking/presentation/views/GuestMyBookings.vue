<template>
  <div class="p-6 max-w-4xl mx-auto">
    <pv-toast /> <div class="flex justify-between items-center mb-6">
    <div class="flex items-center gap-3">
      <pv-button
          icon="pi pi-arrow-left"
          label="Volver"
          class="p-button-outlined p-button-sm"
          @click="goBack"
      />
      <h3 class="text-3xl font-bold text-primary">Mis Reservas</h3>
    </div>

    <language-switcher />
  </div>
    <div v-if="loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem"></i>
      <p class="text-gray-500 mt-2">Buscando tus reservas...</p>
    </div>

    <ul v-else-if="bookings.length" class="space-y-4">
      <li v-for="b in bookings" :key="b.id"
          class="p-4 border rounded-lg shadow-sm bg-white transition-all hover:shadow-md"
      >
        <div class="flex justify-between items-start gap-4">

          <div>
            <h4 class="text-lg font-semibold text-primary">
              {{ b.propertyName }}
            </h4>
            <p class="text-base text-gray-800 font-medium">
              Habitación #{{ b.roomNumber }} ({{ b.roomType }})
            </p>
            <p class="text-sm text-gray-500 mt-1">
              <i class="pi pi-map-marker text-xs"></i> {{ b.propertyLocation }}
            </p>
            <p class="text-sm font-semibold text-gray-900 mt-3">
              <i class="pi pi-calendar text-xs"></i>
              {{ formatDate(b.checkIn) }} → {{ formatDate(b.checkOut) }}
            </p>
          </div>

          <div class="flex flex-col items-end space-y-2 flex-shrink-0">
            <pv-tag :value="b.status" :severity="getStatusSeverity(b.status)" class="mb-2" />

            <pv-button
                v-if="b.status === 'Confirmada' || b.status === 'Pendiente'"
                label="Cancelar"
                icon="pi pi-times-circle"
                class="p-button-sm p-button-danger p-button-outlined"
                @click="cancel(b.id)"
                :loading="cancellingBooking === b.id"
            />

            <pv-button
                v-if="b.status === 'Completada'"
                label="Dejar Reseña"
                icon="pi pi-star"
                class="p-button-sm p-button-info"
                @click="goToReview(b.id)"
            />
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="text-center p-6 bg-gray-50 rounded-lg text-gray-600">
      <i class="pi pi-info-circle mr-2"></i>
      No tienes reservas activas.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from "primevue/useconfirm"; // <-- "ARMA" de confirmación
import { useToast } from "primevue/usetoast";     // <-- "ARMA" de notificación

// --- Componentes y Servicios ---
import { BookingService } from '../../application/BookingService.js';
import { BookingApiRepository } from '../../infrastructure/repositories/BookingApiRepository.js';
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js';
import PvButton from 'primevue/button';
import PvTag from 'primevue/tag';
import PvToast from 'primevue/toast';
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue"; // (Asumiendo que lo tienes global)

// --- "Armas" y "Servicios" ---
const router = useRouter();
const confirm = useConfirm(); // Instancia del "arma"
const toast = useToast();     // Instancia del "arma"

const bookingRepository = new BookingApiRepository();
const propertyRepository = new PropertyApiRepository();
const bookingService = new BookingService(bookingRepository, propertyRepository);

// --- "Estado del Jugador" ---
const bookings = ref([]);
const loading = ref(true);
const cancellingBooking = ref(null);
const guestId = ref(null);

// --- "Tácticas" (Funciones) ---
onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    guestId.value = JSON.parse(storedUser).id;
    await loadBookings();
  } else {
    console.error("GuestMyBookings: No user found!");
    loading.value = false;
  }
});

async function loadBookings() {
  if (!guestId.value) return;
  loading.value = true;
  try {
    bookings.value = await bookingService.getMyBookings(guestId.value);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las reservas.', life: 3000 });
  } finally {
    loading.value = false;
  }
}

// --- "TÁCTICA" DE ELIMINAR/CANCELAR (MEJORADA) ---
async function cancel(bookingId) {
  if (!guestId.value) return;

  // "Táctica" de confirmación (Mejor UX)
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar (cancelar) la reserva #${bookingId}?`,
    header: 'Confirmar Cancelación',
    icon: 'pi pi-info-circle',
    rejectClass: 'p-button-text',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Sí, Cancelar',
    rejectLabel: 'No',
    accept: async () => {
      cancellingBooking.value = bookingId;
      try {
        await bookingService.cancelMyBooking(bookingId, guestId.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Reserva cancelada.', life: 3000 });
        await loadBookings(); // ¡Recargamos para ver el "partido" actualizado!
      } catch (error) {
        console.error(`Error cancelling booking ${bookingId}:`, error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar la reserva.', life: 3000 });
      } finally {
        cancellingBooking.value = null;
      }
    }
  });
}

// --- "TÁCTICA" AÑADIDA: Volver ---
function goBack() {
  router.push({ name: 'guest-dashboard' });
}

// --- "Tácticas" de Ayuda ---
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getStatusSeverity(status) {
  switch (status) {
    case 'Confirmada': return 'success';
    case 'Pendiente': return 'warning';
    case 'Cancelada': return 'danger';
    case 'Completada': return 'info';
    default: return 'secondary';
  }
}

function goToReview(bookingId) {
  router.push({ name: 'guest-review-form', query: { bookingId: bookingId } });
}

</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
</style>