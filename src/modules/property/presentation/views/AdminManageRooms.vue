<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Gestión de Habitaciones (Admin)</h3>
    <div v-if="loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando habitaciones...</p>
    </div>
    <ul v-else-if="rooms.length">
      <li v-for="room in rooms" :key="room.id" class="mb-2 p-2 border rounded">
        Habitación {{ room.number }} — Estado: {{ room.status }}
        <span v-if="room.type"> (Tipo: {{ room.type }})</span>
        <pv-button label="Editar" icon="pi pi-pencil" class="p-button-sm p-button-text ml-2" @click="editRoom(room.id)" />
      </li>
    </ul>
    <p v-else class="text-center p-4">No se encontraron habitaciones.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { PropertyService } from '../../application/PropertyService.js';
import { PropertyApiRepository } from '../../infrastructure/repositories/PropertyApiRepository.js';


const propertyRepository = new PropertyApiRepository();
const propertyService = new PropertyService(propertyRepository);

const rooms = ref([]);
const loading = ref(true);

onMounted(async () => {
  console.log('AdminManageRooms: Fetching rooms...');
  try {
    rooms.value = await propertyService.getRoomList();
    console.log('AdminManageRooms: Rooms fetched:', rooms.value);
  } catch (error) {
    console.error("Error fetching rooms:", error);
  } finally {
    loading.value = false;
  }
});

function editRoom(roomId) {
  console.log('Editar habitación con ID:', roomId);
}
</script>