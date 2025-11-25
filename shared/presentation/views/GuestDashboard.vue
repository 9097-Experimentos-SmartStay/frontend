<template>
  <div class="p-6 max-w-6xl mx-auto">
    <pv-toast position="bottom-right" />
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-primary mb-1">🛏️ {{ t('guestDashboard.title') }}</h1>
        <p class="text-sm text-gray-600">{{ t('guestDashboard.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <pv-button
            icon="pi pi-home"
            label="Ver Habitaciones"
            class="p-button-outlined"
            @click="goToRooms"
        />
        <pv-button
            icon="pi pi-calendar"
            :label="t('guestDashboard.myBookings')"
            class="p-button-secondary"
            @click="goToBookings"
        />
        <pv-button icon="pi pi-sign-out" :label="t('dashboard.logoutButton')" class="p-button-danger" @click="logout" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <pv-card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ t('guestDashboard.upcomingBookings') }}</p>
              <p class="text-2xl font-bold">{{ stats.upcoming }}</p>
            </div>
            <i class="pi pi-calendar text-3xl text-primary"></i>
          </div>
        </template>
      </pv-card>
      <pv-card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Servicios</p>
              <p class="text-2xl font-bold">{{ stats.services }}</p>
            </div>
            <i class="pi pi-concierge-bell text-3xl text-primary"></i>
          </div>
        </template>
      </pv-card>
      <pv-card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Reservas</p>
              <p class="text-2xl font-bold">{{ upcomingBookings.length }}</p>
            </div>
            <i class="pi pi-list text-3xl text-primary"></i>
          </div>
        </template>
      </pv-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Próximas Reservas -->
      <pv-card>
        <template #title>
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{ t('guestDashboard.upcomingBookings') }}</span>
            <pv-button
                class="p-button-text"
                :label="t('guestDashboard.viewAll')"
                @click="goToBookings"
            />
          </div>
        </template>
        <template #content>
          <div v-if="loading" class="text-center p-4">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <p class="text-gray-500 mt-2">Cargando...</p>
          </div>
          <div v-else-if="!upcomingBookings.length" class="text-gray-500 italic p-4">
            {{ t('guestDashboard.noUpcoming') }}
          </div>
          <ul v-else class="space-y-3">
            <li v-for="b in upcomingBookings" :key="b.id" class="p-3 border rounded-md flex items-start justify-between gap-3">
              <div>
                <div class="font-semibold">Habitación #{{ b.roomId }}</div>
                <div class="text-xs text-gray-600">
                  {{ formatDate(b.checkInDate) }} → {{ formatDate(b.checkOutDate) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">Estado: <strong>{{ translateBookingStatus(b.status) }}</strong></div>
              </div>
              <div class="flex gap-2">
                <pv-button
                    v-if="canCancel(b)"
                    icon="pi pi-times"
                    class="p-button-text p-button-danger p-button-sm"
                    @click="cancelBooking(b)"
                    v-tooltip.top="'Cancelar'"
                />
                <pv-button
                    icon="pi pi-eye"
                    class="p-button-text p-button-sm"
                    @click="openBooking(b)"
                    v-tooltip.top="'Ver Detalles'"
                />
              </div>
            </li>
          </ul>
        </template>
      </pv-card>

      <!-- Habitaciones Recientes -->
      <pv-card>
        <template #title>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Habitaciones Recientes</span>
            <pv-button
                class="p-button-text"
                :label="t('guestDashboard.viewAll')"
                @click="goToRooms"
            />
          </div>
        </template>
        <template #content>
          <div v-if="loading || !recentRooms.length" class="text-gray-500 italic p-4">
            {{ loading ? 'Cargando...' : 'No hay habitaciones recientes' }}
          </div>
          <pv-carousel
              v-else
              :value="recentRooms"
              :numVisible="3"
              :numScroll="1"
              :circular="true"
              :autoplayInterval="4000"
              :responsiveOptions="responsiveOptions"
              class="pb-2">
            <template #item="slotProps">
              <div
                  class="border rounded-lg shadow-sm overflow-hidden bg-white m-2 cursor-pointer hover:shadow-md transition-all duration-200"
                  @click="goToRoom(slotProps.data.id)"
              >
                <div class="bg-gray-100 h-28 flex items-center justify-center">
                  <i class="pi pi-home text-4xl text-gray-400"></i>
                </div>
                <div class="p-3">
                  <div class="font-medium text-sm truncate" :title="slotProps.data.roomTypeName || 'Habitación'">
                    {{ slotProps.data.roomTypeName || 'Habitación' }}
                  </div>
                  <div class="text-xs text-gray-600 truncate">
                    ID: {{ slotProps.data.id }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ slotProps.data.description ? slotProps.data.description.substring(0, 30) + '...' : 'Sin descripción' }}
                  </div>
                </div>
              </div>
            </template>
          </pv-carousel>
        </template>
      </pv-card>
    </div>

    <!-- Recomendaciones -->
    <pv-card class="mt-6">
      <template #title>
        <span class="font-semibold">{{ t('guestDashboard.recommendations') }}</span>
      </template>
      <template #content>
        <div v-if="loading" class="text-center p-4">
          <i class="pi pi-spin pi-spinner text-2xl"></i>
        </div>
        <ul v-else class="space-y-2">
          <li v-for="(r, idx) in recommendations" :key="idx" class="p-3 border rounded-md flex justify-between items-center">
            <div>
              <div class="font-medium">{{ r.title }}</div>
              <div class="text-xs text-gray-600">{{ r.description }}</div>
            </div>
            <pv-button class="p-button-sm" icon="pi pi-arrow-right" @click="goToRoom(r.roomId)" />
          </li>
        </ul>
      </template>
    </pv-card>

    <!-- Acciones Rápidas -->
    <pv-card class="mt-6">
      <template #title>
        <span class="font-semibold">{{ t('guestDashboard.quickServices') }}</span>
      </template>
      <template #content>
        <div class="flex gap-2 flex-wrap">
          <pv-button icon="pi pi-concierge-bell" :label="t('guestDashboard.requestService')" class="p-button-info" @click="requestService" />
          <pv-button icon="pi pi-home" label="Ver Habitaciones" class="p-button-secondary" @click="goToRooms" />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { BookingService } from '../../../bookings/application/booking-service.js';
import { RoomService } from '../../../accommodations/application/room-service.js';

const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const bookingSvc = new BookingService();
const roomSvc = new RoomService();

const loading = ref(true);
const upcomingBookings = ref([]);
const recentRooms = ref([]);
const recommendations = ref([]);
const stats = ref({ upcoming: 0, services: 0 });

const responsiveOptions = [
  {
    breakpoint: '1024px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '768px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '560px',
    numVisible: 1,
    numScroll: 1
  }
];

async function loadDashboard() {
  loading.value = true;
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user) throw new Error("User not found");

    const [allBookings, allRooms] = await Promise.all([
      bookingSvc.getAllBookings(),
      roomSvc.getAllRooms()
    ]);

    const userBookings = allBookings.filter(b => {
      const email = b.guestEmail || (typeof b === 'object' && b.guestEmail);
      const name = b.guestName || (typeof b === 'object' && b.guestName);
      return email === user.email || name === (user.name || user.email);
    });

    upcomingBookings.value = userBookings
      .filter(b => {
        const checkOutDate = b.checkOutDate instanceof Date ? b.checkOutDate : new Date(b.checkOutDate);
        return checkOutDate >= new Date();
      })
      .sort((a, b) => {
        const dateA = a.checkInDate instanceof Date ? a.checkInDate : new Date(a.checkInDate);
        const dateB = b.checkInDate instanceof Date ? b.checkInDate : new Date(b.checkInDate);
        return dateA - dateB;
      });

    recentRooms.value = userBookings
      .sort((a, b) => {
        const dateA = a.checkInDate instanceof Date ? a.checkInDate : new Date(a.checkInDate || 0);
        const dateB = b.checkInDate instanceof Date ? b.checkInDate : new Date(b.checkInDate || 0);
        return dateB - dateA;
      })
      .map(booking => {
        const roomId = booking.roomId;
        const room = allRooms.find(r => String(r.id) === String(roomId));
        return room || null;
      })
      .filter(room => room !== null)
      .filter((room, index, self) => 
        index === self.findIndex(r => String(r.id) === String(room.id))
      )
      .slice(0, 3);

    const bookedRoomIdsSet = new Set(userBookings.map(b => b.roomId));
    recommendations.value = allRooms
      .filter(r => !bookedRoomIdsSet.has(r.id))
      .slice(0, 4)
      .map(room => ({
        title: room.roomTypeName || 'Habitación',
        description: room.description || 'Sin descripción',
        roomId: room.id
      }));

    stats.value.upcoming = upcomingBookings.value.length;
    stats.value.services = 0;
  } catch (err) {
    console.error("❌ Error loading dashboard:", err);
    const errorMessage = err.response?.data?.message || err.message || "Error cargando el panel del huésped";
    toast.add({
      severity: "error",
      summary: "Error",
      detail: errorMessage
    });
  } finally {
    loading.value = false;
  }
}

function goToRooms() {
  router.push({ name: 'guest-rooms' });
}

function goToRoom(roomId) {
  router.push({ name: 'guest-room-detail', params: { roomId } });
}

function goToBookings() {
  router.push({ name: 'guest-bookings' });
}

function logout() {
  localStorage.clear();
  router.push("/login");
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function translateBookingStatus(status) {
  const statusMap = {
    'Pending': 'Pendiente',
    'Confirmed': 'Confirmada',
    'Cancelled': 'Cancelada',
    'Completed': 'Completada'
  };
  return statusMap[status] || status;
}

function canCancel(booking) {
  return booking.status === 'Pending' || booking.status === 'Confirmed';
}

async function cancelBooking(booking) {
  try {
    await bookingSvc.cancelBooking(booking.id);
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Reserva cancelada"
    });
    await loadDashboard();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: err.message || "No se pudo cancelar la reserva"
    });
  }
}

function openBooking(booking) {
  router.push({ name: 'guest-booking-detail', params: { bookingId: booking.id } });
}

function requestService() {
  console.log("Request service...");
  toast.add({
    severity: "info",
    summary: "Servicio",
    detail: "Funcionalidad de servicios próximamente"
  });
}

onMounted(loadDashboard);
</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}
</style>
