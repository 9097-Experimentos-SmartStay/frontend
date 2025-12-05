<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <pv-confirm-dialog></pv-confirm-dialog>

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" @click="goBack" />
        <div>
          <h1 class="text-2xl font-bold text-color m-0">Gestión de Hoteles</h1>
          <p class="text-color-secondary m-0">Administra las propiedades de la cadena.</p>
        </div>
      </div>
      <pv-button label="Nuevo Hotel" icon="pi pi-plus" class="p-button-primary" @click="goToCreateHotel" />
    </div>

    <div class="surface-card p-4 shadow-2 border-round">
      <pv-data-table
          :value="hotelStore.hotels"
          :loading="hotelStore.loading"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          class="p-datatable-sm"
      >
        <template #empty>No se encontraron hoteles.</template>

        <pv-column field="id" header="ID" sortable style="width: 80px"></pv-column>

        <pv-column header="Propiedad" sortable field="name">
          <template #body="{ data }">
            <div class="flex align-items-center gap-3">
              <div class="w-3rem h-3rem border-circle overflow-hidden surface-ground border-1 surface-border">
                <img :src="data.photoUrl || 'https://placehold.co/100'" class="w-full h-full object-cover" alt="Hotel" @error="onImageError" />
              </div>
              <div class="flex flex-column">
                <span class="font-bold text-color">{{ data.name }}</span>
                <span class="text-sm text-color-secondary">{{ data.type }}</span>
              </div>
            </div>
          </template>
        </pv-column>

        <pv-column field="location" header="Ubicación" sortable>
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-map-marker text-primary"></i>
              <span class="text-color">{{ data.location || data.city }}</span>
            </div>
          </template>
        </pv-column>

        <pv-column field="basePrice" header="Precio Base" sortable>
          <template #body="{ data }">
            <span class="font-medium text-color">${{ data.basePrice }}</span>
          </template>
        </pv-column>

        <pv-column header="Rating" sortable field="rating">
          <template #body="{ data }">
            <pv-tag :value="data.rating + ' ★'" severity="warning" rounded />
          </template>
        </pv-column>

        <pv-column header="Acciones" style="width: 150px">
          <template #body="{ data }">
            <div class="flex gap-2">
              <pv-button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text p-button-info"
                  v-tooltip="'Editar'"
                  @click="editHotel(data.id)"
              />
              <pv-button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-text p-button-danger"
                  v-tooltip="'Eliminar'"
                  @click="confirmDelete(data)"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm'; // Importar Confirmación
import { useHotelStore } from '@/accommodations/application/hotel.store.js';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm(); // Instancia de confirmación
const hotelStore = useHotelStore();

onMounted(async () => {
  await hotelStore.fetchAllHotels();
});

const goBack = () => router.push({ name: 'staff-dashboard' });

const goToCreateHotel = () => {
  router.push({ name: 'create-hotel' });
};

const onImageError = (event) => {
  event.target.src = 'https://placehold.co/100?text=No+Image';
};

// --- ACCIONES NUEVAS ---

const editHotel = (hotelId) => {
  // Redirige a la vista de edición (asegúrate de tener la ruta creada)
  router.push({ name: 'edit-hotel', params: { hotelId } });
};

const confirmDelete = (hotel) => {
  confirm.require({
    message: `¿Estás seguro de que deseas eliminar "${hotel.name}"? Esta acción borrará todas sus habitaciones asociadas.`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteHotel(hotel.id),
    reject: () => {
      // Opcional: toast de cancelado
    }
  });
};

const deleteHotel = async (id) => {
  try {
    await hotelStore.deleteHotel(id);
    toast.add({ severity: 'success', summary: 'Eliminado', detail: 'El hotel ha sido eliminado.', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el hotel.', life: 3000 });
  }
};
</script>