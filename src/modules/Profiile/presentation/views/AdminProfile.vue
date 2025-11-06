<template>
  <div class="profile-container">
    <pv-toast position="bottom-right" />

    <div class="flex items-center gap-3 mb-6">
      <pv-button
          icon="pi pi-arrow-left"
          class="p-button-secondary p-button-outlined"
          @click="goBack"
          v-tooltip.top="t('common.back')"
      />
      <h2 class="text-3xl font-bold text-gray-800">
        {{ t('menu.profile') }}
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div class="md:col-span-1">
        <pv-card class="shadow-md">
          <template #content>
            <div class="flex flex-col items-center">
              <pv-avatar
                  :label="avatarLabel"
                  class="text-5xl p-avatar-xl mb-4"
                  size="xlarge"
                  shape="circle"
              />
              <h3 class="text-xl font-semibold">{{ profile.full_name }}</h3>
              <p class="text-gray-500 mb-4">{{ user.email }}</p>
              <pv-tag :value="user.role" class="capitalize" />
            </div>
          </template>
        </pv-card>
      </div>

      <div class="md:col-span-2">
        <pv-card class="shadow-md">
          <template #title>
            <span class="font-bold text-xl">Editar Detalles del Perfil</span>
          </template>
          <template #content>
            <div v-if="loading" class="text-center p-4">
              <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            </div>
            <div v-else class="p-fluid flex flex-col gap-4">

              <div class="field">
                <label for="full_name" class="font-semibold">{{ t('adminAddUser.nameLabel') }}</label>
                <pv-input-text
                    id="full_name"
                    v-model="profile.full_name"
                    :placeholder="t('adminAddUser.namePlaceholder')"
                />
              </div>

              <div class="field">
                <label for="email" class="font-semibold">{{ t('adminAddUser.emailLabel') }}</label>
                <pv-input-text
                    id="email"
                    v-model="user.email"
                    :placeholder="t('adminAddUser.emailPlaceholder')"
                />
              </div>

              <div class="field">
                <label for="password" class="font-semibold">{{ t('adminAddUser.passwordLabel') }}</label>
                <pv-password
                    id="password"
                    v-model="password"
                    :placeholder="t('adminAddUser.passwordPlaceholder')"
                    :feedback="false"
                    toggleMask
                />
                <small class="text-gray-500">Dejar en blanco para no cambiar la contraseña.</small>
              </div>

              <div class="flex justify-end mt-4">
                <pv-button
                    :label="t('common.save')"
                    icon="pi pi-check"
                    @click="saveProfile"
                    :loading="saving"
                />
              </div>
            </div>
          </template>
        </pv-card>
      </div>
    </div>

  </div>
</template>

<script setup>
// Importa las "armas"
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import PvButton from 'primevue/button';
import PvCard from 'primevue/card';
import PvToast from 'primevue/toast';
import PvAvatar from 'primevue/avatar';
import PvTag from 'primevue/tag';
import PvInputText from 'primevue/inputtext';
import PvPassword from 'primevue/password';
import Tooltip from 'primevue/tooltip'; // Directiva v-tooltip

// Importa el "Ego" (la lógica)
import { useAdminProfile } from '../composables/useAdminProfile.js';

// Inicializa "Armas"
const router = useRouter();
const { t } = useI18n();

// Carga el "Ego"
const {
  loading,
  saving,
  user,
  profile,
  password,
  avatarLabel,
  saveProfile
} = useAdminProfile();

// "Táctica" de Navegación
function goBack() {
  router.push({ name: 'admin-dashboard' });
}

// Registra la directiva v-tooltip
const vTooltip = Tooltip;
</script>

<style scoped>
/* Estilos del "campo de juego" */
.profile-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1rem;
}
.p-avatar-xl {
  width: 100px;
  height: 100px;
  font-size: 3rem;
}
.capitalize {
  text-transform: capitalize;
}
/* Clases de Tailwind (asumiendo que están disponibles) */
.flex { display: flex; }
.items-center { align-items: center; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.text-xl { font-size: 1.25rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-gray-800 { color: #1f2937; }
.text-gray-500 { color: #6b7280; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media (min-width: 768px) {
  .md\:col-span-1 { grid-column: span 1 / span 1; }
  .md\:col-span-2 { grid-column: span 2 / span 2; }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.flex-col { flex-direction: column; }
.justify-end { justify-content: flex-end; }
.p-fluid .field { margin-bottom: 1.5rem; } /* Espaciado extra para el formulario */
</style>