<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Propiedades Disponibles</h3>
    <div v-for="p in properties" :key="p.id" class="p-card p-3 mb-2">
      <h4>{{ p.name }}</h4>
      <p>{{ p.city }} — ${{ p.price }}</p>
      <button class="p-button p-component" @click="book(p.id)">Reservar</button>
    </div>
  </div>
</template>

<script setup>
import { guestService } from "../../application/guest_service.js";
import { bookingInteraction } from "../../application/booking_interaction.js";

const properties = guestService.getAvailableProperties();

const book = (id) => {
  bookingInteraction.bookProperty(id);
};
</script>
