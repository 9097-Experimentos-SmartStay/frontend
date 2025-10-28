<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Habitaciones Asignadas para Limpieza/Revisión</h3>
    <div v-if="loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando habitaciones asignadas...</p>
    </div>
    <ul v-else-if="rooms.length">
      <li v-for="room in rooms" :key="room.number || room.id" class="mb-2 p-2 border rounded">
        Habitación {{ room.number }} — {{ room.status }}
        <pv-button label="Marcar Limpia" icon="pi pi-check" class="p-button-sm p-button-success ml-2" @click="markCleaned(room.id)" />
      </li>
    </ul>
    <p v-else class="text-center p-4">No tienes habitaciones asignadas con estados pendientes.</p>
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
  console.log('StaffRoomCleaningList: Fetching assigned rooms...');
  try {
    rooms.value = await propertyService.getAssignedRoomsForStaff();
    console.log('StaffRoomCleaningList: Rooms fetched:', rooms.value);
  } catch (error) {
    console.error("Error fetching assigned rooms:", error);
  } finally {
    loading.value = false;
  }
});

async function markCleaned(roomId) {
  console.log(`Marcando habitación ${roomId} como limpia...`);
  // TODO: Uncomment and implement the actual status update when the service method is available
  // try {
  //   await propertyService.updateRoomStatus(roomId, 'Disponible'); // O 'Limpia'
  //   // Actualizar la lista local o volver a cargarla
  //   rooms.value = rooms.value.filter(r => r.id !== roomId); // Ejemplo simple de quitar de la lista
  // } catch (error) {
  //   alert('Error al actualizar estado.');
  // }
}
</script>