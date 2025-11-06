<template>
  <div class="p-4 manage-rooms-container">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog></pv-confirm-dialog>

    <div class="flex justify-between items-center mb-4">
      <pv-button
          icon="pi pi-arrow-left"
          class="p-button-secondary p-button-outlined"
          @click="goBackToDashboard"
          v-tooltip.top="t('common.back')"
      />
      <h2 class="text-2xl font-bold text-center flex-grow">
        <i class="pi pi-building mr-2"></i> {{ t('dashboard.manageRoomsButton') }}
      </h2>
      <LanguageSwitcher />
    </div>

    <pv-toolbar class="mb-4">
      <template #start>
        <pv-button :label="t('common.add')" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
      </template>
      <template #end>
        <pv-button icon="pi pi-refresh" class="p-button-text" @click="loadRooms" :loading="loading" v-tooltip.top="t('common.refresh')"/>
        <pv-select-button v-model="layout" :options="layoutOptions" optionLabel="icon" optionValue="value" dataKey="value" >
          <template #option="slotProps">
            <i :class="slotProps.option.icon"></i>
          </template>
        </pv-select-button>
      </template>
    </pv-toolbar>

    <div class="dataview-container surface-card p-4 border-round shadow-md">

      <div class="dataview-header-filters grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 border-round">

        <div class="col-span-1 md:col-span-2">
          <label for="filter-search" class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search" />
            <pv-input-text id="filter-search" v-model="filterSearchTerm" placeholder="Buscar por N° o Tipo..." class="w-full" />
          </span>
        </div>

        <div class="col-span-1">
          <label for="filter-property" class="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
          <pv-select
              id="filter-property"
              v-model="filterProperty"
              :options="allProperties"
              optionLabel="name"
              optionValue="id"
              placeholder="Todos los Hoteles"
              :showClear="true"
              class="w-full"
          />
        </div>

        <div class="col-span-1">
          <label for="filter-status" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <pv-select
              id="filter-status"
              v-model="filterStatus"
              :options="filterStatusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Todos los Estados"
              :showClear="true"
              class="w-full"
          />
        </div>
      </div>

      <div class="p-dataview-header-info text-center font-bold text-lg mb-4">
        {{ t('adminManageRooms.totalRooms', { count: filteredRooms.length }) }}
      </div>

      <div v-if="loading" class="text-center p-4">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ t('adminManageRooms.loadingMessage') }}</p>
      </div>

      <div v-else-if="!filteredRooms.length" class="text-center p-4">
        {{ t('adminManageRooms.emptyMessage') }}
      </div>

      <div v-else :class="['dataview-content', layout === 'grid' ? 'grid' : 'list']">

        <div v-for="room in paginatedRooms" :key="room.id">

          <div v-if="layout === 'list'" class="col-12">
            <div class="flex flex-col xl:flex-row xl:items-start p-4 gap-4 w-full border-bottom-1 surface-border">
              <img class="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round room-image" :src="room.image_url || defaultImage" :alt="room.type" />

              <div class="flex flex-col items-center sm:items-start gap-2 flex-grow">
                <div class="text-lg font-bold text-900">{{ t('adminManageRooms.roomNumber') }} {{ room.number }} - {{ room.type }}</div>
                <div class="font-semibold text-primary-500">{{ room.propertyName }}</div>
                <div v-if="room.promotion" class="text-sm text-green-600 font-medium"><i class="pi pi-bolt"></i> {{ room.promotion }}</div>
              </div>

              <div class="flex flex-col items-center sm:items-start gap-2" style="min-width: 100px;">
                <div class="flex gap-3 text-gray-600">
                  <i class="pi" :class="[room.amenities?.has_tv ? 'pi-desktop text-primary' : 'pi-desktop text-gray-400']" v-tooltip.top="t('adminManageRooms.amenityTv')"></i>
                  <i class="pi" :class="[room.amenities?.has_room_service ? 'pi-concierge-bell text-primary' : 'pi-concierge-bell text-gray-400']" v-tooltip.top="t('adminManageRooms.roomService')"></i>
                  <i class="pi" :class="[room.amenities?.has_wifi ? 'pi-wifi text-primary' : 'pi-wifi text-gray-400']" v-tooltip.top="t('adminManageRooms.amenityWifi')"></i>
                </div>
              </div>

              <div class="flex flex-col items-center sm:items-start" style="min-width: 120px;">
                <pv-tag :severity="getStatusSeverity(room.status)" :value="t(`roomStatus.${room.status}`)"></pv-tag>
              </div>

              <div class="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                <span class="text-xl font-semibold">${{ (room.price ?? 0).toFixed(2) }}</span>
                <div class="flex gap-1">
                  <pv-button icon="pi pi-pencil" rounded text @click="editRoom(room)" v-tooltip.top="t('common.edit')"></pv-button>
                  <pv-button icon="pi pi-trash" severity="danger" rounded text @click="confirmDeleteRoom(room)" v-tooltip.top="t('common.delete')"></pv-button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="layout === 'grid'" class="col-12 sm:col-6 lg:col-12 xl:col-4 p-2">
            <div class="p-4 border-1 surface-border surface-card border-round">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="font-semibold text-primary-500 text-sm">{{ room.propertyName }}</div>
                <pv-tag :severity="getStatusSeverity(room.status)" :value="t(`roomStatus.${room.status}`)"></pv-tag>
              </div>
              <div class="flex flex-col items-center gap-3 py-5">
                <img class="w-9 shadow-2 border-round room-image" :src="room.image_url || defaultImage" :alt="room.type" />
                <div class="text-lg font-bold">{{ t('adminManageRooms.roomNumber') }} {{ room.number }}</div>
                <div class="font-medium">{{ room.type }}</div>
              </div>
              <div class="flex justify-center gap-3 text-gray-600 mb-3">
                <i class="pi" :class="[room.amenities?.has_tv ? 'pi-desktop text-primary' : 'pi-desktop text-gray-400']" v-tooltip.top="t('adminManageRooms.amenityTv')"></i>
                <i class="pi" :class="[room.amenities?.has_room_service ? 'pi-concierge-bell text-primary' : 'pi-concierge-bell text-gray-400']" v-tooltip.top="t('adminManageRooms.roomService')"></i>
                <i class="pi" :class="[room.amenities?.has_wifi ? 'pi-wifi text-primary' : 'pi-wifi text-gray-400']" v-tooltip.top="t('adminManageRooms.amenityWifi')"></i>
              </div>
              <div v-if="room.promotion" class="text-sm text-green-600 font-medium mb-2 text-center"><i class="pi pi-bolt"></i> {{ room.promotion }}</div>
              <div class="flex items-center justify-between">
                <span class="text-xl font-semibold">${{ (room.price ?? 0).toFixed(2) }}</span>
                <div class="flex gap-1">
                  <pv-button icon="pi pi-pencil" rounded text @click="editRoom(room)" v-tooltip.top="t('common.edit')"></pv-button>
                  <pv-button icon="pi pi-trash" severity="danger" rounded text @click="confirmDeleteRoom(room)" v-tooltip.top="t('common.delete')"></pv-button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <pv-paginator
          v-if="!loading && filteredRooms.length > rowsPerPage"
          :rows="rowsPerPage"
          :totalRecords="filteredRooms.length"
          :first="first"
          @page="onPage"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          class="mt-4 p-dataview-paginator"
      ></pv-paginator>

    </div>

    <pv-dialog v-model:visible="displayDialog" :header="dialogHeader" :modal="true" class="p-fluid w-full max-w-lg">
      <div class="field text-center mb-4">
        <img :src="imagePreview || selectedRoom.image_url || defaultImage" :alt="selectedRoom.type || 'Room Image'" class="w-full max-w-xs border-round shadow-md mx-auto dialog-image-preview" />
        <pv-file-upload mode="basic" name="roomImage[]" accept="image/*" :maxFileSize="1000000"
                        @select="handleImageUpload" chooseLabel="Subir Imagen" class="mt-2" auto/>
        <small>{{ t('adminManageRooms.imageUploadHint') }}</small>
      </div>
      <div class="field">
        <label for="number">{{ t('adminManageRooms.formNumber') }}</label>
        <pv-input-text id="number" v-model.trim="selectedRoom.number" required autofocus :invalid="submitted && !selectedRoom.number" />
        <small class="p-error" v-if="submitted && !selectedRoom.number">{{ t('adminManageRooms.validationNumber') }}</small>
      </div>
      <div class="field">
        <label for="type">{{ t('adminManageRooms.formType') }}</label>
        <pv-input-text id="type" v-model.trim="selectedRoom.type" required :invalid="submitted && !selectedRoom.type" />
        <small class="p-error" v-if="submitted && !selectedRoom.type">{{ t('adminManageRooms.validationType') }}</small>
      </div>
      <div class="field">
        <label for="property">Hotel</label>
        <pv-select
            id="property"
            v-model="selectedRoom.propertyId"
            :options="allProperties"
            optionLabel="name"
            optionValue="id"
            placeholder="Selecciona un hotel"
            required
            :invalid="submitted && !selectedRoom.propertyId"
            class="w-full"
        />
        <small class="p-error" v-if="submitted && !selectedRoom.propertyId">El hotel es requerido.</small>
      </div>
      <div class="field">
        <label for="price">{{ t('adminManageRooms.formPrice') }}</label>
        <pv-input-number id="price" v-model="selectedRoom.price" mode="currency" currency="USD" locale="en-US" required :invalid="submitted && selectedRoom.price == null"/>
        <small class="p-error" v-if="submitted && selectedRoom.price == null">{{ t('adminManageRooms.validationPrice') }}</small>
      </div>
      <div class="field">
        <label for="status">{{ t('adminManageRooms.formStatus') }}</label>
        <pv-select id="status" v-model="selectedRoom.status" :options="roomStatusOptions" optionLabel="label" optionValue="value" required :invalid="submitted && !selectedRoom.status"/>
        <small class="p-error" v-if="submitted && !selectedRoom.status">{{ t('adminManageRooms.validationStatus') }}</small>
      </div>
      <div class="field">
        <label>{{ t('adminManageRooms.formAmenities') }}</label>
        <div class="flex flex-wrap gap-3 mt-2">
          <div class="flex items-center">
            <pv-checkbox inputId="amenity_tv" v-model="selectedRoom.amenities.has_tv" :binary="true"/>
            <label for="amenity_tv" class="ml-2"> {{ t('adminManageRooms.amenityTv') }} </label>
          </div>
          <div class="flex items-center">
            <pv-checkbox inputId="amenity_rs" v-model="selectedRoom.amenities.has_room_service" :binary="true"/>
            <label for="amenity_rs" class="ml-2"> {{ t('adminManageRooms.amenityRoomService') }} </label>
          </div>
          <div class="flex items-center">
            <pv-checkbox inputId="amenity_wifi" v-model="selectedRoom.amenities.has_wifi" :binary="true"/>
            <label for="amenity_wifi" class="ml-2"> {{ t('adminManageRooms.amenityWifi') }} </label>
          </div>
        </div>
      </div>
      <div class="field">
        <label for="promotion">{{ t('adminManageRooms.formPromotion') }}</label>
        <pv-textarea id="promotion" v-model="selectedRoom.promotion" rows="3" cols="20" />
      </div>
      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" text @click="hideDialog"/>
        <pv-button :label="t('common.save')" icon="pi pi-check" @click="saveRoom" :loading="saving"/>
      </template>
    </pv-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

// --- Importa componentes PrimeVue ---
import PvPaginator from 'primevue/paginator';
import PvDataView from 'primevue/dataview'; // Aunque no lo usas, es bueno saber que existe
import PvButton from 'primevue/button';
import PvDialog from 'primevue/dialog';
import PvInputText from 'primevue/inputtext';
import PvTextarea from 'primevue/textarea';
import PvSelect from 'primevue/select';
import PvInputNumber from 'primevue/inputnumber';
import PvCheckbox from 'primevue/checkbox';
import PvFileUpload from 'primevue/fileupload';
import PvTag from 'primevue/tag';
import PvRating from 'primevue/rating';
import PvBadge from 'primevue/badge'; // No usado, pero importado
import PvToolbar from 'primevue/toolbar';
import PvSelectButton from 'primevue/selectbutton';
import PvToast from 'primevue/toast';
import PvConfirmDialog from 'primevue/confirmdialog';
import Tooltip from 'primevue/tooltip';
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue';

// --- Importa Servicios y Repositorios ---
import { PropertyService } from '../../application/PropertyService.js';
import { PropertyApiRepository } from '../../infrastructure/repositories/PropertyApiRepository.js';
import axios from 'axios';

// --- Inicializa hooks ---
const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// --- Instancia Servicios ---
const propertyRepository = new PropertyApiRepository();
const propertyService = new PropertyService(propertyRepository);

// --- Estado del Componente ---
const rooms = ref([]); // Datos crudos de la API
const allProperties = ref([]); // Datos crudos de la API
const loading = ref(true);
const saving = ref(false);
const displayDialog = ref(false);
const selectedRoom = ref({ amenities: {} });
const isNewRoom = ref(false);
const submitted = ref(false);
const imagePreview = ref(null);
const layout = ref('grid');
const layoutOptions = ref([
  { icon: 'pi pi-th-large', value: 'grid' },
  { icon: 'pi pi-bars', value: 'list' },
]);
const defaultImage = 'https://placehold.co/300x200/cccccc/ffffff?text=No+Image';
const newImageFile = ref(null);

// --- ESTADO PARA PAGINACIÓN ---
const first = ref(0);
const rowsPerPage = ref(6);

// --- "TÁCTICA" 1: "ARMAS" DE FILTRO ---
const filterSearchTerm = ref('');
const filterProperty = ref(null); // (null = todos)
const filterStatus = ref(null); // (null = todos)

// Opciones para el filtro de estado (con "Todos" añadido)
const filterStatusOptions = computed(() => [
  { label: t('tasks.filterAll'), value: null }, // Opción para "Todos"
  { label: t('roomStatus.available'), value: 'available' },
  { label: t('roomStatus.occupied'), value: 'occupied' },
  { label: t('roomStatus.cleaning'), value: 'cleaning' },
  { label: t('roomStatus.maintenance'), value: 'maintenance' },
]);

// --- "TÁCTICA" 2: "QUÍMICA" (Enriquecer datos) ---
// Añade el 'propertyName' a cada habitación
const enrichedRooms = computed(() => {
  if (!rooms.value.length || !allProperties.value.length) return rooms.value;
  return rooms.value.map(room => {
    const property = allProperties.value.find(p => p.id === room.propertyId);
    return {
      ...room,
      propertyName: property?.name || 'Hotel Desconocido' // Añade el nombre del hotel
    };
  });
});

// --- "TÁCTICA" 3: "METAVISIÓN" (Filtrar datos) ---
// Filtra los datos enriquecidos basado en los refs de filtro
const filteredRooms = computed(() => {
  let tempRooms = enrichedRooms.value;
  const query = filterSearchTerm.value.toLowerCase().trim();

  // 1. Filtro de Texto
  if (query) {
    tempRooms = tempRooms.filter(
        r => r.number.toLowerCase().includes(query) ||
            r.type.toLowerCase().includes(query)
    );
  }
  // 2. Filtro de Hotel
  if (filterProperty.value) {
    tempRooms = tempRooms.filter(r => r.propertyId === filterProperty.value);
  }
  // 3. Filtro de Estado
  if (filterStatus.value) {
    tempRooms = tempRooms.filter(r => r.status === filterStatus.value);
  }

  return tempRooms;
});

// --- "TÁCTICA" 4: "PAGINACIÓN EVOLUCIONADA" ---
// Pagina los datos YA filtrados
const paginatedRooms = computed(() => {
  if (!filteredRooms.value || filteredRooms.value.length === 0) {
    return [];
  }
  const startIndex = first.value;
  const endIndex = first.value + rowsPerPage.value;
  return filteredRooms.value.slice(startIndex, endIndex);
});

// --- Función para manejar cambio de página ---
function onPage(event) {
  first.value = event.first;
  window.scrollTo(0, 0);
}

// --- Lógica de Carga de Datos ---
const roomStatusOptions = computed(() => [
  { label: t('roomStatus.available'), value: 'available' },
  { label: t('roomStatus.occupied'), value: 'occupied' },
  { label: t('roomStatus.cleaning'), value: 'cleaning' },
  { label: t('roomStatus.maintenance'), value: 'maintenance' },
]);
const dialogHeader = computed(() => {
  return isNewRoom.value ? t('adminManageRooms.dialogNewHeader') : t('adminManageRooms.dialogEditHeader');
});

onMounted(() => {
  // Carga ambas listas en paralelo
  loadRooms();
  loadProperties();
});

async function loadRooms() {
  loading.value = true;
  console.log('AdminManageRooms: Fetching rooms...');
  try {
    rooms.value = await propertyService.getRoomList();
    console.log('AdminManageRooms: Rooms fetched:', rooms.value);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    toast.add({ severity: 'error', summary: t('errors.fetchError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function loadProperties() {
  console.log('AdminManageRooms: Fetching properties...');
  try {
    allProperties.value = await propertyService.getPropertyList();
    console.log('AdminManageRooms: Properties fetched:', allProperties.value.length);
  } catch (error) {
    console.error("Error fetching properties:", error);
    toast.add({ severity: 'warn', summary: 'Error de Carga', detail: 'No se pudo cargar la lista de hoteles.', life: 3000 });
  }
}

// --- Lógica del Diálogo (Formulario) ---
function openNew() {
  selectedRoom.value = { amenities: { has_tv: false, has_room_service: false, has_wifi: false } };
  imagePreview.value = null; isNewRoom.value = true; submitted.value = false; displayDialog.value = true;
}
function editRoom(room) {
  // Asegura que los amenities no sean null
  const amenities = room.amenities || { has_tv: false, has_room_service: false, has_wifi: false };
  selectedRoom.value = { ...room, amenities: { ...amenities } };
  imagePreview.value = null; isNewRoom.value = false; submitted.value = false; displayDialog.value = true;
}
function hideDialog() {
  displayDialog.value = false; submitted.value = false; selectedRoom.value = { amenities: {} }; imagePreview.value = null; newImageFile.value = null;
}
async function saveRoom() {
  submitted.value = true;
  if (!selectedRoom.value.number?.trim() ||
      !selectedRoom.value.type?.trim() ||
      selectedRoom.value.price == null ||
      !selectedRoom.value.status ||
      !selectedRoom.value.propertyId) {
    toast.add({ severity: 'warn', summary: t('errors.validationError'), detail: t('adminManageRooms.validationAllFields'), life: 3000 });
    return;
  }

  saving.value = true;
  const roomDataToSave = { ...selectedRoom.value };

  try {
    if (newImageFile.value) {
      console.log('Detectado nuevo archivo de imagen. Disparando a Cloudinary...');

      const formData = new FormData();
      formData.append('file', newImageFile.value);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const response = await axios.post(uploadUrl, formData);
      roomDataToSave.image_url = response.data.secure_url;
      console.log('¡GOL! Imagen subida. URL:', roomDataToSave.image_url);

    } else if (isNewRoom.value && !roomDataToSave.image_url) {
      roomDataToSave.image_url = defaultImage;
    }

    if (isNewRoom.value) {
      await propertyService.createRoom(roomDataToSave);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.createSuccess'), life: 3000 });
    } else {
      await propertyService.updateRoomDetails(selectedRoom.value.id, roomDataToSave);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.updateSuccess'), life: 3000 });
    }

    hideDialog();
    await loadRooms(); // Recarga la lista

  } catch (error) {
    console.error("Error en la 'jugada' (Cloudinary o API):", error);
    toast.add({ severity: 'error', summary: t('errors.saveError'), detail: error.message || t('errors.tryAgain'), life: 4000 });
  } finally {
    saving.value = false;
  }
}
function confirmDeleteRoom(room) {
  confirm.require({
    message: t('adminManageRooms.confirmDeleteMessage', { number: room.number }),
    header: t('adminManageRooms.confirmDeleteHeader'), icon: 'pi pi-exclamation-triangle',
    rejectLabel: t('common.cancel'), acceptLabel: t('common.delete'), acceptClass: 'p-button-danger',
    accept: async () => { await deleteRoom(room.id); },
    reject: () => { toast.add({ severity: 'info', summary: t('common.cancelled'), detail: t('adminManageRooms.deleteCancelled'), life: 3000 }); }
  });
}
async function deleteRoom(roomId) {
  console.log(`Deleting room ${roomId}...`);
  try {
    await propertyService.removeRoom(roomId);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.deleteSuccess'), life: 3000 });
    await loadRooms(); // Recarga la lista
  } catch (error) {
    console.error("Error deleting room:", error);
    toast.add({ severity: 'error', summary: t('errors.deleteError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}
// (La lógica de deleteSelectedRooms se queda igual)
function confirmDeleteSelectedRooms() {
  // ...
}
async function deleteSelectedRooms() {
  // ...
}
function handleImageUpload(event) {
  const file = event.files[0];
  if (file) {
    newImageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => { imagePreview.value = e.target.result; };
    reader.onerror = (e) => {
      console.error("FileReader error:", e);
      toast.add({ severity: 'error', summary: t('errors.uploadError'), detail: t('adminManageRooms.imageUploadError'), life: 3000 });
    };
    reader.readAsDataURL(file);
    toast.add({ severity: 'info', summary: t('common.success'), detail: t('adminManageRooms.imageUploaded'), life: 3000 });
  }
}

// --- Funciones de Ayuda (Helpers) ---
function getStatusSeverity(status) {
  switch (status?.toLowerCase()) {
    case 'available': return 'success'; case 'occupied': return 'danger';
    case 'cleaning': return 'info'; case 'maintenance': return 'warning';
    default: return 'secondary';
  }
}
function getStatusLabel(status) { return t(`roomStatus.${status || 'unknown'}`); }
function goBackToDashboard() { router.push({ name: 'admin-dashboard' }); }

const vTooltip = Tooltip;
</script>

<style scoped>
.manage-rooms-container { max-width: 1400px; margin: 1rem auto; } /* Más ancho para la vista pro */
.room-image { width: 100%; max-width: 200px; height: auto; object-fit: cover; }
.dialog-image-preview { max-height: 200px; width: auto; max-width: 100%; object-fit: contain; }

/* --- "TÁCTICA" 5: ESTILOS EVOLUCIONADOS --- */

/* Contenedor principal de la vista de datos */
.dataview-container {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
}

/* Cabecera de filtros */
.dataview-header-filters {
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-border);
}

/* Cabecera de información (Conteo) */
.p-dataview-header-info {
  background: var(--surface-b);
  border-bottom: 1px solid var(--surface-border);
  padding: 1rem;
}

/* Estilos para layout grid manual */
.dataview-content.grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.5rem; /* Gutters */
}
.dataview-content.grid > div {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}
@media (min-width: 640px) { .dataview-content.grid > div.sm\:col-6 { width: 50%; } }
@media (min-width: 1024px) { .dataview-content.grid > div.lg\:col-12 { width: 100%; } }
@media (min-width: 1280px) { .dataview-content.grid > div.xl\:col-4 { width: 33.3333%; } }

/* Estilo para layout list manual */
.dataview-content.list > div { width: 100%; }
.dataview-content.list .border-bottom-1:last-child {
  border-bottom: 0; /* Evita doble borde en el último item */
}

/* Clases de utilidad (Tailwind/PrimeFlex) */
.border-bottom-1 { border-bottom: 1px solid; }
.surface-border { border-color: var(--surface-border); }
.gap-1 { gap: 0.25rem; } .gap-2 { gap: 0.5rem; } .gap-3 { gap: 1rem; } .gap-4 { gap: 1.5rem; }
.items-center { align-items: center; } .justify-between { justify-content: space-between; }
.mx-auto { margin-left: auto; margin-right: auto;} .max-w-xs { max-width: 20rem; } .max-w-lg { max-width: 32rem; }
.text-primary { color: var(--primary-color); }
.text-primary-500 { color: var(--primary-500); }
.text-green-600 { color: #16a34a; }
.text-gray-400 { color: #9ca3af; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }

.p-dataview-paginator {
  background: var(--surface-b);
  border-top: 1px solid var(--surface-d);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
.surface-card { background: var(--surface-card); }
.border-1 { border-width: 1px; border-style: solid; }
.border-round { border-radius: 8px; }
.shadow-2 { box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12); }
.p-4 { padding: 1rem; } .p-2 { padding: 0.5rem; } .py-5 { padding-top: 3rem; padding-bottom: 3rem; }
.mb-2 { margin-bottom: 0.5rem; } .mb-3 { margin-bottom: 0.75rem; } .mb-4 { margin-bottom: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.w-9 { width: 75%; }
.w-full { width: 100%; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.text-900 { color: var(--text-color); }
.flex-grow { flex-grow: 1; }
.text-center { text-align: center; }
.text-sm { font-size: 0.875rem; }
.bg-gray-50 { background-color: #f9fafb; }
</style>