<template>
  <div class="surface-ground min-h-screen p-4 md:p-6">
    <pv-toast position="bottom-right" />

    <div class="surface-card p-4 shadow-2 border-round mb-4 flex justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-secondary" @click="goBack" />
        <div>
          <h1 class="text-2xl font-bold text-color m-0">Inventario de Habitaciones</h1>
          <p class="text-color-secondary m-0">Estado y mantenimiento de cuartos.</p>
        </div>
      </div>
      <pv-button label="Nueva Habitación" icon="pi pi-plus" class="p-button-success" />
    </div>

    <div class="surface-card p-4 shadow-2 border-round">
      <pv-data-table
          :value="roomStore.rooms"
          :loading="roomStore.loading"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          filterDisplay="menu"
          class="p-datatable-sm"
      >
        <template #empty>No hay habitaciones registradas.</template>

        <pv-column field="id" header="N° Habitación" sortable style="width: 120px">
          <template #body="{ data }">
            <span class="font-bold text-lg">#{{ data.id }}</span>
          </template>
        </pv-column>

        <pv-column field="roomTypeName" header="Tipo" sortable>
          <template #body="{ data }">
            <pv-tag :value="data.roomTypeName" severity="info" />
          </template>
        </pv-column>

        <pv-column field="description" header="Descripción">
          <template #body="{ data }">
            <span class="text-color-secondary text-sm">{{ truncate(data.description, 50) }}</span>
          </template>
        </pv-column>

        <pv-column header="Amenidades">
          <template #body="{ data }">
            <div class="flex gap-1 flex-wrap">
               <span v-for="am in (data.amenities || []).slice(0, 2)" :key="am" class="surface-200 text-600 text-xs px-2 py-1 border-round">
                 {{ am }}
               </span>
              <span v-if="data.amenities?.length > 2" class="text-xs text-500">+{{ data.amenities.length - 2 }}</span>
            </div>
          </template>
        </pv-column>

        <pv-column header="Estado" style="width: 120px">
          <template #body>
            <pv-tag value="Disponible" severity="success" rounded />
          </template>
        </pv-column>

        <pv-column header="Acciones">
          <template #body>
            <div class="flex gap-2">
              <pv-button icon="pi pi-cog" class="p-button-rounded p-button-text p-button-secondary" v-tooltip="'Mantenimiento'" />
              <pv-button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info" />
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
import { useRoomStore } from '@/accommodations/application/room.store.js';

const router = useRouter();
const roomStore = useRoomStore();

onMounted(async () => {
  await roomStore.fetchAllRooms();
});

const goBack = () => router.push({ name: 'staff-dashboard' });

const truncate = (text, length) => {
  if(!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}
</script>