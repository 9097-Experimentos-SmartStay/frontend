<template>
  <div class="p-4 flex flex-column align-items-center justify-content-center">
    <h2 class="text-2xl mb-4">Crear Cuenta</h2>

    <div class="p-fluid w-25rem">
      <div class="field">
        <label for="name">Nombre completo</label>
        <input
            id="name"
            v-model="name"
            type="text"
            class="p-inputtext p-component w-full"
            placeholder="Tu nombre"
        />
      </div>

      <div class="field">
        <label for="email">Correo electrónico</label>
        <input
            id="email"
            v-model="email"
            type="email"
            class="p-inputtext p-component w-full"
            placeholder="ejemplo@email.com"
        />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <input
            id="password"
            v-model="password"
            type="password"
            class="p-inputtext p-component w-full"
            placeholder="••••••"
        />
      </div>

      <div class="field">
        <label for="role">Modo de usuario</label>
        <select v-model="role" class="p-inputtext p-component w-full">
          <option value="admin">Administrador</option>
          <option value="staff">Staff</option>
          <option value="guest">Huésped</option>
        </select>
      </div>

      <button class="p-button p-component w-full mt-3" @click="registerUser">
        Registrarse
      </button>

      <p class="mt-3 text-sm text-center">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="text-blue-600">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("guest");
const router = useRouter();

const registerUser = () => {
  // Aquí podrías conectar con tu backend o AuthService real
  console.log(`🆕 Registro completado: ${name.value} (${role.value})`);

  if (role.value === "admin") router.push("/admin");
  else if (role.value === "staff") router.push("/staff");
  else router.push("/guest");
};
</script>


