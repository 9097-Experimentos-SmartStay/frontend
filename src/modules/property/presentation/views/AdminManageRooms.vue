// src/modules/property/presentation/views/AdminManageRooms.vue
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
        <pv-button :label="t('common.delete')" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelectedRooms" :disabled="!selectedRooms || !selectedRooms.length" />
      </template>
      <template #end>
        <pv-button icon="pi pi-refresh" class="p-button-text" @click="loadRooms" :loading="loading" v-tooltip.top="t('common.refresh')"/>
        <pv-select-button v-model="layout" :options="layoutOptions" optionLabel="icon" dataKey="value" >
          <template #option="slotProps">
            <i :class="slotProps.option.icon"></i>
          </template>
        </pv-select-button>
      </template>
    </pv-toolbar>

    <pv-data-view :value="rooms" :layout="layout" :paginator="true" :rows="6" :loading="loading"
                  v-model:selection="selectedRooms" dataKey="id" selectionMode="multiple">

      <template #header>
        <div class="text-center font-bold">{{ t('adminManageRooms.totalRooms', { count: rooms.length }) }}</div>
      </template>

      <template #list="slotProps">
        <div class="col-12">
          <div class="flex flex-col xl:flex-row xl:items-start p-4 gap-4 w-full border-bottom-1 surface-border">
            <img class="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round room-image" :src="slotProps.data.image_url || defaultImage" :alt="slotProps.data.type" />
            <div class="flex flex-col sm:flex-row justify-between items-center xl:items-start flex-1 gap-4">
              <div class="flex flex-col items-center sm:items-start gap-3">
                <div class="text-lg font-bold text-900">{{ t('adminManageRooms.roomNumber') }} {{ slotProps.data.number }} - {{ slotProps.data.type }}</div>
                <pv-rating :modelValue="4" readonly :cancel="false"></pv-rating> {/* Placeholder rating */}
                <div class="flex items-center gap-3">
                                <span class="flex items-center gap-2">
                                    <i class="pi pi-tag"></i>
                                    <span class="font-semibold">{{ getStatusLabel(slotProps.data.status) }}</span>
                                </span>
                  <pv-tag :severity="getStatusSeverity(slotProps.data.status)" :value="t(`roomStatus.${slotProps.data.status}`)"></pv-tag>
                </div>
                <div class="text-sm">TV: {{ slotProps.data.amenities?.has_tv ? 'Sí' : 'No' }} | {{ t('adminManageRooms.roomService') }}: {{ slotProps.data.amenities?.has_room_service ? 'Sí' : 'No' }}</div>
                <div v-if="slotProps.data.promotion" class="text-sm text-primary-500 font-medium">{{ t('adminManageRooms.promotion') }}: {{ slotProps.data.promotion }}</div>
              </div>
              <div class="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                <span class="text-xl font-semibold">${{ slotProps.data.price?.toFixed(2) }}</span>
                <div class="flex gap-1">
                  <pv-button icon="pi pi-pencil" rounded text @click="editRoom(slotProps.data)" v-tooltip.top="t('common.edit')"></pv-button>
                  <pv-button icon="pi pi-trash" severity="danger" rounded text @click="confirmDeleteRoom(slotProps.data)" v-tooltip.top="t('common.delete')"></pv-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #grid="slotProps">
        <div class="col-12 sm:col-6 lg:col-12 xl:col-4 p-2">
          <div class="p-4 border-1 surface-border surface-card border-round">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <i class="pi pi-tag"></i>
                <span class="font-semibold">{{ getStatusLabel(slotProps.data.status) }}</span>
              </div>
              <pv-tag :severity="getStatusSeverity(slotProps.data.status)" :value="t(`roomStatus.${slotProps.data.status}`)"></pv-tag>
            </div>
            <div class="flex flex-col items-center gap-3 py-5">
              <img class="w-9 shadow-2 border-round room-image" :src="slotProps.data.image_url || defaultImage" :alt="slotProps.data.type" />
              <div class="text-lg font-bold">{{ t('adminManageRooms.roomNumber') }} {{ slotProps.data.number }}</div>
              <div class="font-medium">{{ slotProps.data.type }}</div>
              <pv-rating :modelValue="4" readonly :cancel="false"></pv-rating> {/* Placeholder */}
            </div>
            <div class="text-sm mb-2">TV: {{ slotProps.data.amenities?.has_tv ? 'Sí' : 'No' }} | {{ t('adminManageRooms.roomService') }}: {{ slotProps.data.amenities?.has_room_service ? 'Sí' : 'No' }}</div>
            <div v-if="slotProps.data.promotion" class="text-sm text-primary-500 font-medium mb-2">{{ t('adminManageRooms.promotion') }}: {{ slotProps.data.promotion }}</div>
            <div class="flex items-center justify-between">
              <span class="text-xl font-semibold">${{ slotProps.data.price?.toFixed(2) }}</span>
              <div class="flex gap-1">
                <pv-button icon="pi pi-pencil" rounded text @click="editRoom(slotProps.data)" v-tooltip.top="t('common.edit')"></pv-button>
                <pv-button icon="pi pi-trash" severity="danger" rounded text @click="confirmDeleteRoom(slotProps.data)" v-tooltip.top="t('common.delete')"></pv-button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        {{ t('adminManageRooms.emptyMessage') }}
      </template>
      <template #loading>
        {{ t('adminManageRooms.loadingMessage') }}
      </template>
    </pv-data-view>

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
import PvDataView from 'primevue/dataview';
import PvButton from 'primevue/button';
import PvDialog from 'primevue/dialog';
import PvInputText from 'primevue/inputtext';
import PvTextarea from 'primevue/textarea';
import PvSelect from 'primevue/select'; // O Dropdown
import PvInputNumber from 'primevue/inputnumber';
import PvCheckbox from 'primevue/checkbox';
import PvFileUpload from 'primevue/fileupload';
import PvImage from 'primevue/image'; // Para mostrar imagen
import PvTag from 'primevue/tag';
import PvRating from 'primevue/rating';
import PvBadge from 'primevue/badge';
import PvToolbar from 'primevue/toolbar';
import PvSelectButton from 'primevue/selectbutton';
import PvToast from 'primevue/toast';
import PvConfirmDialog from 'primevue/confirmdialog';
import Tooltip from 'primevue/tooltip';
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue'; // Ajusta ruta

// --- Importa Servicios y Repositorios ---
import { PropertyService } from '../../application/PropertyService.js'; // Ajusta capitalización
import { PropertyApiRepository } from '../../infrastructure/repositories/PropertyApiRepository.js'; // Ajusta capitalización

// --- Inicializa hooks ---
const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// --- Instancia Servicios ---
const propertyRepository = new PropertyApiRepository();
const propertyService = new PropertyService(propertyRepository);

// --- Estado del Componente ---
const rooms = ref([]);
const selectedRooms = ref([]); // Para selección múltiple
const loading = ref(true);
const saving = ref(false);
const displayDialog = ref(false);
const selectedRoom = ref({ amenities: {} }); // Objeto para añadir/editar, inicializa amenities
const isNewRoom = ref(false);
const submitted = ref(false);
const imagePreview = ref(null); // Para previsualizar imagen Base64
const layout = ref('grid'); // Estado para DataView
const layoutOptions = ref([ // Opciones para SelectButton
  { icon: 'pi pi-th-large', value: 'grid' },
  { icon: 'pi pi-bars', value: 'list' },
]);
const defaultImage = 'https://via.placeholder.com/300x200/cccccc/ffffff?text=No+Image'; // Imagen por defecto

// Opciones para el select de estado
const roomStatusOptions = ref([
  { label: t('roomStatus.available'), value: 'available' },
  { label: t('roomStatus.occupied'), value: 'occupied' },
  { label: t('roomStatus.cleaning'), value: 'cleaning' },
  { label: t('roomStatus.maintenance'), value: 'maintenance' },
]);

// --- Carga Inicial ---
onMounted(() => {
  loadRooms();
});

// --- Métodos ---
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

function openNew() {
  selectedRoom.value = { amenities: { has_tv: false, has_room_service: false, has_wifi: false } }; // Resetea con amenities
  imagePreview.value = null; // Limpia preview
  isNewRoom.value = true;
  submitted.value = false;
  displayDialog.value = true;
}

function editRoom(room) {
  // Clona el objeto para evitar modificar la lista directamente
  selectedRoom.value = { ...room, amenities: { ...(room.amenities || {}) } }; // Clona amenities también
  imagePreview.value = null; // Limpia preview al editar (se usará image_url existente)
  isNewRoom.value = false;
  submitted.value = false;
  displayDialog.value = true;
}

function hideDialog() {
  displayDialog.value = false;
  submitted.value = false;
  selectedRoom.value = { amenities: {} }; // Limpia
  imagePreview.value = null;
}

async function saveRoom() {
  submitted.value = true;
  // Validación básica
  if (!selectedRoom.value.number?.trim() || !selectedRoom.value.type?.trim() || selectedRoom.value.price == null || !selectedRoom.value.status) {
    toast.add({ severity: 'warn', summary: t('errors.validationError'), detail: t('adminManageRooms.validationAllFields'), life: 3000 });
    return;
  }

  saving.value = true;
  const roomDataToSave = { ...selectedRoom.value };
  // Si hay una imagen en preview (Base64), úsala. Si no, no envíes image_url (PATCH no lo borrará)
  if (imagePreview.value) {
    roomDataToSave.image_url = imagePreview.value;
  } else {
    // Si es un cuarto nuevo y no se subió imagen, usa la default o deja null
    if (isNewRoom.value && !roomDataToSave.image_url) {
      roomDataToSave.image_url = null; // O la defaultImage si prefieres guardarla
    } else if (!isNewRoom.value) {
      // Si editamos y no hay preview, NO envíes image_url para no sobreescribir con null/undefined
      delete roomDataToSave.image_url;
    }
  }


  try {
    if (isNewRoom.value) {
      // --- Crear Habitación ---
      // Asegura propertyId (aquí asumimos 101, deberías tener un selector o pasarlo)
      roomDataToSave.propertyId = roomDataToSave.propertyId || 101;
      await propertyService.createRoom(roomDataToSave);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.createSuccess'), life: 3000 });
    } else {
      // --- Actualizar Habitación ---
      await propertyService.updateRoomDetails(selectedRoom.value.id, roomDataToSave);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.updateSuccess'), life: 3000 });
    }
    hideDialog();
    await loadRooms(); // Recarga la lista
  } catch (error) {
    console.error("Error saving room:", error);
    toast.add({ severity: 'error', summary: t('errors.saveError'), detail: error.message || t('errors.tryAgain'), life: 4000 });
  } finally {
    saving.value = false;
  }
}

function confirmDeleteRoom(room) {
  confirm.require({
    message: t('adminManageRooms.confirmDeleteMessage', { number: room.number }),
    header: t('adminManageRooms.confirmDeleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: t('common.cancel'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: async () => {
      await deleteRoom(room.id);
    },
    reject: () => {
      toast.add({ severity: 'info', summary: t('common.cancelled'), detail: t('adminManageRooms.deleteCancelled'), life: 3000 });
    }
  });
}

// Borrar una sola habitación
async function deleteRoom(roomId) {
  console.log(`Deleting room ${roomId}...`);
  try {
    await propertyService.removeRoom(roomId);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.deleteSuccess'), life: 3000 });
    selectedRooms.value = selectedRooms.value.filter(r => r.id !== roomId); // Quita de seleccionados si estaba
    await loadRooms(); // Recarga
  } catch (error) {
    console.error("Error deleting room:", error);
    toast.add({ severity: 'error', summary: t('errors.deleteError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

// Borrar habitaciones seleccionadas (requiere DataView con selectionMode="multiple")
function confirmDeleteSelectedRooms() {
  confirm.require({
    message: t('adminManageRooms.confirmDeleteSelectedMessage', { count: selectedRooms.value.length }),
    header: t('adminManageRooms.confirmDeleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: t('common.cancel'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: async () => {
      await deleteSelectedRooms();
    },
    reject: () => {
      toast.add({ severity: 'info', summary: t('common.cancelled'), detail: t('adminManageRooms.deleteCancelled'), life: 3000 });
    }
  });
}

async function deleteSelectedRooms() {
  console.log('Deleting selected rooms...', selectedRooms.value.map(r => r.id));
  let deletedCount = 0;
  let errorOccurred = false;
  // Borra uno por uno (json-server no suele soportar borrado masivo por defecto)
  for (const room of selectedRooms.value) {
    try {
      await propertyService.removeRoom(room.id);
      deletedCount++;
    } catch (error) {
      console.error(`Error deleting room ${room.id}:`, error);
      errorOccurred = true;
      // Podrías parar aquí o continuar borrando los demás
    }
  }
  selectedRooms.value = []; // Limpia selección
  await loadRooms(); // Recarga
  if (errorOccurred) {
    toast.add({ severity: 'warn', summary: t('adminManageRooms.deletePartialError'), detail: t('adminManageRooms.deletePartialDetail', { success: deletedCount }), life: 5000 });
  } else {
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.deleteSelectedSuccess', { count: deletedCount }), life: 3000 });
  }
}


// Maneja la selección de archivo (usando Base64)
function handleImageUpload(event) {
  const file = event.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Guarda el resultado Base64 para enviarlo y mostrarlo
      selectedRoom.value.image_url = e.target.result; // Actualiza el objeto
      imagePreview.value = e.target.result; // Actualiza la preview
      toast.add({ severity: 'info', summary: t('common.success'), detail: t('adminManageRooms.imageUploaded'), life: 3000 });
    };
    reader.onerror = (e) => {
      console.error("FileReader error:", e);
      toast.add({ severity: 'error', summary: t('errors.uploadError'), detail: t('adminManageRooms.imageUploadError'), life: 3000 });
    };
    reader.readAsDataURL(file); // Lee el archivo como Base64
  }
}

// --- Helpers para Tags de Estado ---
function getStatusSeverity(status) {
  switch (status?.toLowerCase()) {
    case 'available': return 'success';
    case 'occupied': return 'danger';
    case 'cleaning': return 'info';
    case 'maintenance': return 'warning';
    default: return 'secondary';
  }
}
function getStatusLabel(status) { // Para mostrar texto en list view si es necesario
  return t(`roomStatus.${status || 'unknown'}`);
}

// --- Navegación ---
function goBackToDashboard() {
  router.push({ name: 'admin-dashboard' });
}

// Registra Directiva Tooltip
const vTooltip = Tooltip;

</script>

<style scoped>
.manage-rooms-container {
  max-width: 1200px;
  margin: 1rem auto;
}
.room-image {
  width: 100%; /* Make image responsive */
  max-width: 200px; /* Limit max width */
  height: auto;
  object-fit: cover; /* Crop image nicely */
}
.dialog-image-preview {
  max-height: 200px; /* Limit height in dialog */
  width: auto;
  max-width: 100%;
  object-fit: contain; /* Show whole image */
}
.p-dataview .p-dataview-content {
  background: transparent; /* Remove default background if needed */
}
.border-bottom-1 { border-bottom: 1px solid; }
.surface-border { border-color: var(--surface-border); }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 1rem; }
.gap-4 { gap: 1.5rem; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.mx-auto { margin-left: auto; margin-right: auto;}
.max-w-xs { max-width: 20rem; }
.max-w-lg { max-width: 32rem; }
.text-primary-500 { color: var(--primary-500); }
</style>