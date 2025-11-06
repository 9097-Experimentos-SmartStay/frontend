<template>
  <div class="admin-dashboard-container">
    <pv-toast position="bottom-right" />

    <!-- 1. BARRA DE HERRAMIENTAS PROFESIONAL -->
    <pv-toolbar class="shadow-sm border-b border-gray-200 px-4 py-3">
      <template #start>
        <!-- Logo y Nombre de la Startup -->
        <div class="flex items-center gap-3">
          <svg class="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
          </svg>
          <span class="text-xl font-bold text-gray-800">SmartStay</span>
        </div>
      </template>

      <template #center>
        <!-- Opciones de Navegación -->
        <div class="hidden md:flex gap-2">
          <pv-button
              :label="t('dashboard.manageStaffButton')"
              icon="pi pi-users"
              class="p-button-text text-gray-700"
              @click="router.push({ name: 'admin-manage-users' })"
          />
          <pv-button
              :label="t('dashboard.manageRoomsButton')"
              icon="pi pi-building"
              class="p-button-text text-gray-700"
              @click="router.push({ name: 'admin-manage-rooms' })"
          />
        </div>
      </template>

      <template #end>
        <!-- Controles de Usuario y Idioma -->
        <div class="flex items-center gap-3">
          <LanguageSwitcher />
          <pv-button
              icon="pi pi-user"
              class="p-button-rounded p-button-text p-button-secondary"
              @click="toggleUserMenu"
              aria-haspopup="true"
              aria-controls="overlay_menu"
          />
          <!-- Menú de Usuario Desplegable -->
          <pv-menu ref="userMenu" :model="userMenuItems" :popup="true" />
        </div>
      </template>
    </pv-toolbar>

    <!-- 2. CONTENIDO DEL DASHBOARD -->
    <div class="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <!-- Mensaje de Bienvenida -->
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        {{ t('dashboard.welcomeMessage', { name: userName }) }} 👋
      </h1>

      <!-- 3. TARJETAS DE ESTADÍSTICAS (KPIs) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <pv-card class="shadow-sm">
          <template #title>
            <div class="flex items-center justify-between">
              <span class="text-base font-medium">{{ t('adminManageRooms.totalRooms', { count: '' }) }}</span>
              <i class="pi pi-building text-gray-400"></i>
            </div>
          </template>
          <template #content>
            <p v-if="loading" class="text-3xl font-bold"><i class="pi pi-spin pi-spinner"></i></p>
            <p v-else class="text-3xl font-bold text-primary">{{ stats.rooms }}</p>
          </template>
        </pv-card>

        <pv-card class="shadow-sm">
          <template #title>
            <div class="flex items-center justify-between">
              <span class="text-base font-medium">{{ t('adminManageUsers.registeredStaff') }}</span>
              <i class="pi pi-users text-gray-400"></i>
            </div>
          </template>
          <template #content>
            <p v-if="loading" class="text-3xl font-bold"><i class="pi pi-spin pi-spinner"></i></p>
            <p v-else class="text-3xl font-bold text-primary">{{ stats.staff }}</p>
          </template>
        </pv-card>

        <pv-card class="shadow-sm">
          <template #title>
            <div class="flex items-center justify-between">
              <span class="text-base font-medium">Reservas (Hoy)</span>
              <i class="pi pi-calendar-plus text-gray-400"></i>
            </div>
          </template>
          <template #content>
            <p class="text-3xl font-bold text-primary">0</p>
            <small class="text-gray-500">(Datos de ejemplo)</small>
          </template>
        </pv-card>

        <pv-card class="shadow-sm">
          <template #title>
            <div class="flex items-center justify-between">
              <span class="text-base font-medium">Tasa Ocupación</span>
              <i class="pi pi-chart-pie text-gray-400"></i>
            </div>
          </template>
          <template #content>
            <p class="text-3xl font-bold text-primary">0%</p>
            <small class="text-gray-500">(Datos de ejemplo)</small>
          </template>
        </pv-card>
      </div>

      <!-- 4. TARJETAS DE ACCIÓN RÁPIDA -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <pv-card class="shadow-sm hover:shadow-md transition-shadow">
          <template #title>
            <i class="pi pi-users mr-2"></i> {{ t('dashboard.manageStaffButton') }}
          </template>
          <template #content>
            <p class="text-gray-600 mb-4">
              Añade, edita o elimina miembros del personal. Asigna tareas y revisa sus turnos.
            </p>
            <pv-button
                label="Ir a Staff"
                icon="pi pi-arrow-right"
                iconPos="right"
                class="p-button-outlined"
                @click="router.push({ name: 'admin-manage-users' })"
            />
          </template>
        </pv-card>

        <pv-card class="shadow-sm hover:shadow-md transition-shadow">
          <template #title>
            <i class="pi pi-building mr-2"></i> {{ t('dashboard.manageRoomsButton') }}
          </template>
          <template #content>
            <p class="text-gray-600 mb-4">
              Crea nuevas habitaciones, actualiza precios, estado (limpieza, mantenimiento) y sube imágenes.
            </p>
            <pv-button
                label="Ir a Habitaciones"
                icon="pi pi-arrow-right"
                iconPos="right"
                class="p-button-outlined"
                @click="router.push({ name: 'admin-manage-rooms' })"
            />
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Importa los componentes de PrimeVue necesarios
import PvToolbar from 'primevue/toolbar';
import PvButton from 'primevue/button';
import PvMenu from 'primevue/menu';
import PvCard from 'primevue/card';
import PvToast from 'primevue/toast';

// Importa el LanguageSwitcher
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue';

// --- Importa los "servicios" para cargar datos ---
import { PropertyService } from '../../../property/application/PropertyService.js';
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js';
// (Usaremos ProfileApiRepository para contar al staff)
import { ProfileApiRepository } from '../../../auth/infrastructure/repositories/ProfileApiRepository.js';


// --- Inicializa "Armas" ---
const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const userName = ref('');
const loading = ref(true);

// --- "Armas" para Estadísticas ---
const stats = ref({
  rooms: 0,
  staff: 0,
  // puedes añadir más KPIs aquí
});

// Instancia los servicios
const propertyRepo = new PropertyApiRepository();
const propertySvc = new PropertyService(propertyRepo);
const profileRepo = new ProfileApiRepository();

// --- "Armas" para el Menú de Usuario ---
const userMenu = ref();
const userMenuItems = ref([
  {
    label: 'Perfil',
    icon: 'pi pi-user-edit',
    command: () => {
      toast.add({ severity: 'info', summary: 'Info', detail: 'Función de perfil no implementada', life: 3000 });
    }
  },
  {
    separator: true
  },
  {
    label: t('dashboard.logoutButton'),
    icon: 'pi pi-sign-out',
    command: logout // Llama a tu función de logout
  }
]);

// --- "Táctica" de Carga (onMounted) ---
onMounted(() => {
  const storedUser = localStorage.getItem('user');
  userName.value = storedUser ? JSON.parse(storedUser).name : t('dashboard.defaultUser');
  console.log('AdminDashboard mounted. User:', userName.value);

  // Carga las estadísticas del dashboard
  loadDashboardStats();
});

// --- "Tácticas" (Funciones) ---

async function loadDashboardStats() {
  console.log("Cargando estadísticas del dashboard...");
  loading.value = true;
  try {
    // "Disparos" en paralelo para más velocidad
    const [roomsData, profilesData] = await Promise.all([
      propertySvc.getRoomList(),
      profileRepo.getProfiles()
    ]);

    // Contamos los "goles"
    stats.value.rooms = roomsData.length;

    // Asumimos que "staff" es cualquier perfil con un "cargo" (position)
    stats.value.staff = profilesData.filter(p => p.position).length;

    console.log("Estadísticas cargadas:", stats.value);

  } catch (error) {
    console.error("Error cargando estadísticas:", error);
    toast.add({ severity: 'error', summary: 'Error de Red', detail: 'No se pudieron cargar las estadísticas.', life: 3000 });
  } finally {
    loading.value = false;
  }
}

function toggleUserMenu(event) {
  userMenu.value.toggle(event);
}

function logout() {
  console.log('Logging out...');
  localStorage.clear();
  router.push({ name: 'login' });
}
</script>

<style scoped>
/* Estilos globales para el dashboard */
.admin-dashboard-container {
  background-color: #f9f9f9; /* Un fondo gris muy claro para el contenedor */
  min-height: 100vh;
}

/* Clases de Tailwind (asumiendo que están disponibles) */
.text-primary {
  color: var(--primary-color); /* Usa el color primario de tu tema PrimeVue */
}
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.border-b { border-bottom-width: 1px; }
.border-gray-200 { border-color: #e5e7eb; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.hover\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.transition-shadow { transition-property: box-shadow; transition-duration: 150ms; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.p-4 { padding: 1rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.lg\:p-6 { padding: 1.5rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mr-2 { margin-right: 0.5rem; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media (min-width: 768px) {
  .md\:flex { display: flex; }
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.text-gray-800 { color: #1f2937; }
.text-gray-700 { color: #374151; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-xl { font-size: 1.25rem; }
.text-lg { font-size: 1.125rem; }
.text-base { font-size: 1rem; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.h-8 { height: 2rem; }
.w-8 { width: 2rem; }
.hidden { display: none; }
</style>