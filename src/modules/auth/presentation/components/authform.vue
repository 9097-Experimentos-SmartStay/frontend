<template>
  <div class="p-card p-4 max-w-md mx-auto mt-10">
    <h2 class="text-center mb-4">{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</h2>

    <div class="p-fluid">
      <div class="field">
        <label>Email</label>
        <InputText v-model="form.email" />
      </div>

      <div class="field" v-if="!isLogin">
        <label>Nombre</label>
        <InputText v-model="form.name" />
      </div>

      <div class="field">
        <label>Contraseña</label>
        <Password v-model="form.password" toggleMask />
      </div>

      <div class="field">
        <label>Rol</label>
        <Dropdown v-model="form.role" :options="roles" optionLabel="label" optionValue="value" placeholder="Seleccionar rol" />
      </div>

      <Button :label="isLogin ? 'Ingresar' : 'Registrar'" class="mt-3 w-full" @click="submitForm" />
    </div>

    <p class="text-center mt-3">
      <a href="#" @click.prevent="toggleMode">{{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { InputText } from 'primevue/inputtext';
import { Password } from 'primevue/password';
import { Dropdown } from 'primevue/dropdown';
import { Button } from 'primevue/button';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLogin = ref(true);

const form = ref({ email: '', name: '', password: '', role: '' });

const roles = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Staff', value: 'staff' },
  { label: 'Huésped', value: 'guest' },
];

function toggleMode() {
  isLogin.value = !isLogin.value;
}

async function submitForm() {
  try {
    if (!form.value.role) {
      alert('Selecciona un rol');
      return;
    }

    if (isLogin.value) {
      const { data } = await axios.get(`http://localhost:3001/users?email=${form.value.email}`);
      const user = data[0];
      if (!user || user.password !== form.value.password || user.role !== form.value.role) {
        alert('Credenciales incorrectas o rol inválido');
        return;
      }
      await router.push(`/${user.role}`);
    } else {
      await axios.post('http://localhost:3001/users', form.value);
      alert('Usuario registrado correctamente');
      isLogin.value = true;
    }
  } catch (error) {
    console.error(error);
  }
}
</script>

