<template>
  <div class="p-4 flex flex-column align-items-center justify-content-center">
    <h2 class="text-2xl mb-4">Iniciar Sesión</h2>

    <div class="p-fluid">
      <div class="field">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model="email" type="email" class="p-inputtext p-component w-full" />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" class="p-inputtext p-component w-full" />
      </div>

      <div class="field">
        <label for="role">Modo de usuario</label>
        <select v-model="role" class="p-inputtext p-component w-full">
          <option value="admin">Administrador</option>
          <option value="staff">Staff</option>
          <option value="guest">Huésped</option>
        </select>
      </div>

      <button class="p-button p-component w-full mt-3" @click="loginUser">Ingresar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const role = ref("guest");
const router = useRouter();

const loginUser = () => {
  // Aquí podrías conectar con tu AuthService o API real
  console.log(`✅ Login correcto: ${email.value} como ${role.value}`);

  if (role.value === "admin") router.push("/admin");
  else if (role.value === "staff") router.push("/staff");
  else router.push("/guest");
};
</script>
