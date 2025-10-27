<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Dejar una Reseña</h3>
    <input v-model="review" placeholder="Escribe tu reseña..." class="p-inputtext p-component w-full mb-2" />
    <button class="p-button p-component" @click="submitReview">Enviar</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { bookingInteraction } from "../../application/booking_interaction.js";

const review = ref("");

const submitReview = () => {
  bookingInteraction.addReview(1, review.value); // Ejemplo estático
  review.value = "";
};
</script>
