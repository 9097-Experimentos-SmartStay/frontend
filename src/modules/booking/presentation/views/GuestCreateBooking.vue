<template>
  <div class="p-6 max-w-3xl mx-auto">
    <pv-toast />

    <div class="mb-6">
      <h1 class="text-3xl font-bold text-primary">Confirmar tu Reserva</h1>
      <p class="text-gray-600">Estás a un paso de asegurar tu estadía.</p>
    </div>

    <div v-if="loading" class="text-center py-16">
      <pv-progress-spinner />
      <p class="text-gray-500 mt-4">Cargando detalles...</p>
    </div>

    <div v-else-if="error" class="text-center py-16">
      <i class="pi pi-times-circle text-red-500 text-4xl mb-3"></i>
      <h2 class="text-xl font-semibold text-red-600">Error</h2>
      <p class="text-gray-600">{{ error }}</p>
      <pv-button label="Volver" icon="pi pi-arrow-left" class="p-button-outlined mt-4" @click="$router.go(-1)" />
    </div>

    <div v-else-if="property && room" class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div>
        <div class="bg-white p-4 rounded-lg shadow-md border mb-6">
          <h2 class="text-lg font-semibold">{{ property.name }}</h2>
          <p class="text-gray-700 font-bold text-primary">{{ room.name || `Habitación #${room.number}` }}</p>
          <p class="text-sm text-gray-600">{{ room.type }}</p>
          <p class="text-2xl font-bold mt-2">${{ room.price }} <span class="text-base font-normal text-gray-500">/ noche</span></p>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-md border">
          <h3 class="font-semibold mb-2">Selecciona tus fechas</h3>
          <pv-calendar
              v-model="dates"
              selectionMode="range"
              inline
              :minDate="minDate"
              dateFormat="dd/mm/yy"
              class="w-full"
          />
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg border h-fit">
        <h2 class="text-xl font-bold mb-4">Resumen del "Tiro"</h2>

        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-600">Check-in:</span>
          <span class="font-medium">{{ dates && dates[0] ? dates[0].toLocaleDateString() : '---' }}</span>
        </div>

        <div class="flex justify-between items-center mb-4">
          <span class="text-gray-600">Check-out:</span>
          <span class="font-medium">{{ dates && dates[1] ? dates[1].toLocaleDateString() : '---' }}</span>
        </div>

        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600">Noches:</span>
            <span class="font-medium">{{ bookingSummary.numNights }}</span>
          </div>
          <div class="flex justify-between items-center mb-4">
            <span class="text-gray-600">Precio x Noche:</span>
            <span class="font-medium">${{ room.price }}</span>
          </div>

          <div class="border-t pt-4 flex justify-between items-center">
            <span class="text-xl font-bold">Total:</span>
            <span class="text-2xl font-bold text-primary">${{ bookingSummary.totalPrice }}</span>
          </div>
        </div>

        <pv-button
            label="¡Reservar Ahora!"
            icon="pi pi-check"
            class="p-button-success w-full mt-6"
            :loading="isBooking"
            :disabled="bookingSummary.numNights <= 0"
            @click="handleBooking"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
// Importamos las "armas" de PrimeVue
import PvButton from 'primevue/button';
import PvToast from 'primevue/toast';
import PvProgressSpinner from 'primevue/progressspinner';
import PvCalendar from 'primevue/calendar';

// Importamos el "Ego"
import { useCreateBooking } from '../composables/useCreateBooking.js';

const {
  property,
  room,
  dates,
  loading,
  isBooking,
  error,
  bookingSummary,
  handleBooking,
  minDate
} = useCreateBooking();

</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
</style>