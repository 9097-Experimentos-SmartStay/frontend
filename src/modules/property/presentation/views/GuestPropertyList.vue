<template>
  <div class="p-4">
    <h3 class="text-xl mb-3">Propiedades Disponibles</h3>
    <div v-if="loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando propiedades...</p>
    </div>
    <div v-else-if="properties.length">
      <div v-for="p in properties" :key="p.id" class="p-card p-3 mb-3 shadow rounded">
        <h4 class="text-lg font-semibold">{{ p.name }}</h4>
        <p>Ubicación: {{ p.location || p.city || 'No especificada' }}</p> <p v-if="p.price">Precio: ${{ p.price }} por noche</p>
        <pv-button label="Reservar" icon="pi pi-calendar-plus" class="mt-2" @click="book(p.id)" :loading="bookingLoading === p.id" />
      </div>
    </div>
    <p v-else class="text-center p-4">No hay propiedades disponibles en este momento.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { PropertyService } from '../../application/PropertyService.js';
import { PropertyApiRepository } from '../../infrastructure/repositories/PropertyApiRepository.js';
//TODO: Importar BookingService cuando esté creado
import { BookingService } from '../../../booking/application/BookingService.js';
import { BookingApiRepository } from '../../../booking/infrastructure/repositories/BookingApiRepository.js';

// Instances of services and repositories
const propertyRepository = new PropertyApiRepository();
const propertyService = new PropertyService(propertyRepository);
const bookingRepository = new BookingApiRepository();
const bookingService = new BookingService(bookingRepository, propertyRepository);


const properties = ref([]);
const loading = ref(true);
const bookingLoading = ref(null);

onMounted(async () => {
  console.log('GuestPropertyList: Fetching properties...');
  try {
    properties.value = await propertyService.getPropertyList();
    console.log('GuestPropertyList: Properties fetched:', properties.value);
  } catch (error) {
    console.error("Error fetching properties:", error);
  } finally {
    loading.value = false;
  }
});

async function book(propertyId) {
  bookingLoading.value = propertyId;
  console.log('Intentando reservar propiedad con ID:', propertyId);
  try {
    const storedUser = localStorage.getItem('user');
    const guestId = storedUser ? JSON.parse(storedUser).id : null;

    if (!guestId) {
      alert('Error: No se pudo identificar al huésped.');
      return;
    }

    await bookingService.bookProperty(propertyId, guestId /*, other details like dates */);
    alert(`Reserva iniciada para la propiedad ${propertyId}.`); // Temporary feedback
  } catch (error) {
    console.error("Error al intentar reservar:", error);
    alert(`Error al reservar: ${error.message || 'Intente de nuevo.'}`);
  } finally {
    bookingLoading.value = null;
  }
}
</script>