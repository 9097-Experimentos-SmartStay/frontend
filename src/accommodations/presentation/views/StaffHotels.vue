<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" @click="goBack" />
        <div>
          <h1 class="text-2xl font-bold text-color m-0">Gestión de Hoteles</h1>
          <p class="text-color-secondary m-0">Administra las propiedades de la cadena.</p>
        </div>
      </div>
      <pv-button label="Nuevo Hotel" icon="pi pi-plus" class="p-button-primary" @click="openNewHotelDialog" />
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
              <div class="w-3rem h-3rem border-circle overflow-hidden bg-gray-200">
                <img :src="data.photoUrl || 'https://placehold.co/100'" class="w-full h-full object-cover" alt="Hotel" />
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
            <i class="pi pi-map-marker text-primary mr-1"></i>
            {{ data.location || data.city }}
          </template>
        </pv-column>

        <pv-column field="basePrice" header="Precio Base" sortable>
          <template #body="{ data }">
            <span class="font-medium">${{ data.basePrice }}</span>
          </template>
        </pv-column>

        <pv-column header="Rating" sortable field="rating">
          <template #body="{ data }">
            <pv-tag :value="data.rating + ' ★'" severity="warning" rounded />
          </template>
        </pv-column>

        <pv-column header="Acciones" style="width: 150px">
          <template #body>
            <div class="flex gap-2">
              <pv-button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info" v-tooltip="'Editar'" />
              <pv-button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" v-tooltip="'Eliminar'" />
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
import { useHotelStore } from '@/accommodations/application/hotel.store.js';

const router = useRouter();
const toast = useToast();
const hotelStore = useHotelStore();

onMounted(async () => {
  await hotelStore.fetchAllHotels();
});

const goBack = () => router.push({ name: 'staff-dashboard' });

const openNewHotelDialog = () => {
  toast.add({ severity: 'info', summary: 'Próximamente', detail: 'Formulario de creación en construcción.' });
};
</script>