// src/modules/auth/presentation/views/AdminEditUser.vue
<template>
  <div class="p-4 edit-user-container">
    <h2 class="text-2xl font-bold mb-4">
      <i class="pi pi-user-edit mr-2"></i> Editar Usuario: {{ userData.name || userData.email || 'Cargando...' }}
    </h2>

    <div v-if="loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando datos del usuario...</p>
    </div>

    <div v-else-if="userData.id" class="p-fluid max-w-lg mx-auto">
      {/* Formulario para editar */}
      <div class="field">
        <label for="name">Nombre Completo</label>
        <pv-input-text id="name" v-model="editableProfileData.full_name" />
      </div>

      <div class="field">
        <label for="email">Correo Electrónico</label>
        <pv-input-text id="email" v-model="editableUserData.email" />
      </div>

      <div class="field">
        <label for="role">Rol</label>
        {/* Usamos las mismas opciones traducidas que en AuthForm */}
        <pv-select id="role" v-model="editableUserData.role" :options="translatedRoles" optionLabel="label" optionValue="value" placeholder="Seleccionar Rol" />
      </div>

      {/* Campos del Perfil (ej: Puesto, Turno) */}
      <div class="field" v-if="editableUserData.role === 'staff'">
        <label for="position">Puesto</label>
        <pv-input-text id="position" v-model="editableProfileData.position" />
      </div>

      <div class="field p-grid p-nogutter" v-if="editableUserData.role === 'staff'">
        <div class="p-col-6 pr-1">
          <label for="shift_start">Inicio Turno (HH:MM)</label>
          <pv-input-text id="shift_start" v-model="editableProfileData.shift_start" placeholder="08:00" />
        </div>
        <div class="p-col-6 pl-1">
          <label for="shift_end">Fin Turno (HH:MM)</label>
          <pv-input-text id="shift_end" v-model="editableProfileData.shift_end" placeholder="16:00"/>
        </div>
      </div>

      <div class="field" v-if="editableUserData.role === 'staff'">
        <label for="status">Estado Actual</label>
        <pv-select id="status" v-model="editableProfileData.current_status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar Estado"/>
      </div>


      <div class="mt-4 flex justify-end gap-2">
        <pv-button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelEdit" />
        <pv-button label="Guardar Cambios" icon="pi pi-check" @click="saveChanges" :loading="saving" />
      </div>

    </div>
    <div v-else class="text-center p-4 text-red-500">
      Error: No se pudieron cargar los datos del usuario.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios'; // Usaremos Axios directamente por simplicidad aquí


// --- Estado y Configuración ---
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const userId = ref(route.params.userId); // Obtiene el ID de la URL
const userData = ref({}); // Datos originales del usuario (users)
const profileData = ref({}); // Datos originales del perfil (profiles)
const editableUserData = ref({}); // Copia para editar (users)
const editableProfileData = ref({}); // Copia para editar (profiles)

const loading = ref(true);
const saving = ref(false);

const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;

// --- Opciones para Selects (Roles y Estados) ---
// Roles (igual que en AuthForm)
const baseRoles = ref([
  { key: 'auth.roleAdmin', value: 'admin' },
  { key: 'auth.roleStaff', value: 'staff' },
  { key: 'auth.roleGuest', value: 'guest' },
  { key: 'auth.roleVisitor', value: 'visitor' }
]);
const translatedRoles = computed(() => baseRoles.value.map(role => ({ label: t(role.key), value: role.value })));

// Estados (igual que en AdminManageUsers) - Asegúrate que las claves coincidan con `staffStatus` en los JSON de i18n
const statusOptions = ref([
  { label: t('staffStatus.available'), value: 'available'},
  { label: t('staffStatus.busy'), value: 'busy'},
  { label: t('staffStatus.on_break'), value: 'on_break'},
  { label: t('staffStatus.off_duty'), value: 'off_duty'} // Opcional si solo se maneja por turno
]);


// --- Carga de Datos ---
onMounted(async () => {
  if (!userId.value) {
    console.error("EditUser: No userId provided in route params.");
    loading.value = false;
    // Podrías redirigir o mostrar un error más claro
    return;
  }
  console.log("EditUser: Loading data for userId:", userId.value);
  try {
    // 1. Cargar datos del usuario (/users/:id)
    const userRes = await axios.get(`${API_BASE_URL}/users/${userId.value}`);
    userData.value = userRes.data;
    editableUserData.value = { ...userRes.data }; // Clona para edición

    // 2. Cargar datos del perfil (/profiles?user_id=...)
    //    Usamos query param porque no sabemos el ID del perfil directamente
    const profileRes = await axios.get(`${API_BASE_URL}/profiles`, { params: { user_id: userId.value } });
    if (profileRes.data && profileRes.data.length > 0) {
      profileData.value = profileRes.data[0];
      editableProfileData.value = { ...profileRes.data[0] }; // Clona para edición
    } else {
      // Si no hay perfil, inicializa editableProfileData vacío o con defaults
      profileData.value = {}; // Para saber que no existía
      editableProfileData.value = { user_id: parseInt(userId.value) }; // Asegura user_id para posible creación
      console.warn("EditUser: No profile found for userId:", userId.value);
    }

  } catch (error) {
    console.error("Error loading user/profile data:", error);
    // Mostrar mensaje de error al usuario
  } finally {
    loading.value = false;
  }
});

// --- Acciones ---
async function saveChanges() {
  saving.value = true;
  console.log("Saving changes for user:", userId.value);
  console.log("User data:", editableUserData.value);
  console.log("Profile data:", editableProfileData.value);

  try {
    // 1. Actualizar datos del usuario (PATCH para no sobreescribir password si no cambia)
    await axios.patch(`${API_BASE_URL}/users/${userId.value}`, {
      email: editableUserData.value.email,
      role: editableUserData.value.role
      // NO enviamos password a menos que haya un campo para cambiarla
    });

    // 2. Actualizar o Crear datos del perfil
    if (profileData.value.id) {
      // Si el perfil existía (tiene ID), actualízalo (PATCH)
      await axios.patch(`${API_BASE_URL}/profiles/${profileData.value.id}`, editableProfileData.value);
    } else if (editableProfileData.value.full_name) { // Solo crea si hay al menos un nombre
      // Si el perfil NO existía, créalo (POST)
      // Asegura que user_id sea número si los IDs son numéricos
      editableProfileData.value.user_id = parseInt(editableProfileData.value.user_id);
      await axios.post(`${API_BASE_URL}/profiles`, editableProfileData.value);
    }

    alert("¡Usuario actualizado con éxito!");
    router.push({ name: 'admin-manage-users' }); // Vuelve a la lista

  } catch (error) {
    console.error("Error saving changes:", error);
    alert(`Error al guardar: ${error.message || 'Intente de nuevo.'}`);
  } finally {
    saving.value = false;
  }
}

function cancelEdit() {
  // Simplemente navega de vuelta a la lista sin guardar
  router.push({ name: 'admin-manage-users' });
}
</script>

<style scoped>
.edit-user-container {
  max-width: 800px;
  margin: 2rem auto;
}
.p-grid { display: grid; }
.p-nogutter { gap: 0; }
.p-col-6 { grid-column: span 6 / span 6; }
.pr-1 { padding-right: 0.25rem; }
.pl-1 { padding-left: 0.25rem; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mx-auto { margin-left: auto; margin-right: auto;}
.max-w-lg { max-width: 32rem; /* Ajusta según necesites */ }
.text-red-500 { color: #ef4444; }
</style>