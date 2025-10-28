<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4 text-primary">🛏️ SmartStay - Guest Dashboard</h1>
    <p class="text-lg mb-3">Bienvenido, Huésped 👋</p>
    <p>Podrás ver tus reservas, servicios contratados y recomendaciones personalizadas.</p>
    <div class="flex gap-4">
      <router-link to="/guest/properties" class="p-button p-component">Ver Propiedades</router-link>
      <router-link to="/guest/bookings" class="p-button p-component">Mis Reservas</router-link>
      <router-link to="/guest/review" class="p-button p-component">Dejar Reseña</router-link>
    </div>
    <Button
        label="Cerrar sesión"
        icon="pi pi-sign-out"
        class="mt-4"
        @click="logout"
    />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import  Button  from "primevue/button";

const router = useRouter();

const logout = () => {
  router.push("/login");
};
</script>


