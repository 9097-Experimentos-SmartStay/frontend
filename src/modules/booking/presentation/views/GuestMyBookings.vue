<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Mis Reservas</h3>
    <ul>
      <li v-for="b in bookings" :key="b.id">
        {{ b.property }} — {{ b.date }} — {{ b.status }}
        <button class="ml-2 p-button p-component" @click="cancel(b.id)">
          Cancelar
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { guestService } from "../../../guest/application/guest_service.js";
import { bookingInteraction } from "../../../guest/application/booking_interaction.js";

const bookings = guestService.getMyBookings();

const cancel = (id) => {
  bookingInteraction.cancelBooking(id);
};
</script>
