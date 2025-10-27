<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">Panel del Staff</h2>
    <p class="text-lg mb-3">Bienvenido, Personal de Servicio 👋</p>
    <p>Aquí podrás ver tus tareas asignadas, reportes y horarios.</p>

    <div class="flex gap-4">
      <router-link to="/staff/tasks" class="p-button p-component">Ver Tareas</router-link>
      <router-link to="/staff/rooms" class="p-button p-component">Habitaciones Asignadas</router-link>
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


