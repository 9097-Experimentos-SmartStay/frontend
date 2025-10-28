<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4 text-primary">🏨 Panel del Administrador</h1>
    <p class="mb-4">Bienvenido, Administrador 👋</p>
    <div class="flex gap-4">
      <router-link to="/admin/staff" class="p-button p-component">Gestionar Staff</router-link>
      <router-link to="/admin/rooms" class="p-button p-component">Gestionar Habitaciones</router-link>
    </div>

    <Button
        label="Cerrar sesión"
        icon="pi pi-sign-out"
        class="mt-2"
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


