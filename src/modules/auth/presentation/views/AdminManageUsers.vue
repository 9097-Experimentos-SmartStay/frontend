// src/modules/auth/presentation/views/AdminManageUsers.vue
<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Gestión del Staff / Usuarios</h3>
    <div v-if="loading">Cargando...</div>
    <ul v-else-if="users.length">
      <li v-for="user in users" :key="user.id">
        {{ user.email }} — {{ user.role }} </li>
    </ul>
    <p v-else>No se encontraron usuarios.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { UserService } from '../../application/UserService.js';
import { UserAPIRepository } from '../../infrastructure/repositories/user_api_repository.js';

// Instancia el servicio (esto podría hacerse mejor con inyección de dependencias)
const userRepository = new UserAPIRepository();
const userService = new UserService(userRepository);

const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // Llama al servicio para obtener todos los usuarios o solo staff
    // users.value = await userService.getUserList('staff'); // Solo staff
    users.value = await userService.getUserList(); // Todos los usuarios
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    loading.value = false;
  }
});
</script>