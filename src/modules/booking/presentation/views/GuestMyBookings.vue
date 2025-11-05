<template>
  <div class="p-6 max-w-6xl mx-auto">
    <pv-toast />
    <pv-confirm-dialog />

    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver"
            class="p-button-outlined p-button-sm"
            @click="goBack"
        />
        <h3 class="text-3xl font-bold text-primary">Mis Reservas</h3>
      </div>
      <language-switcher />
    </div>

    <div v-if="loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem"></i>
      <p class="text-gray-500 mt-2">Buscando tus reservas...</p>
    </div>

    <pv-data-table
        v-else-if="bookings.length"
        :value="bookings"
        responsive-layout="scroll"
        tableStyle="min-width: 50rem"
        class="shadow-sm rounded-lg overflow-hidden"
    >
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="text-lg font-semibold text-primary">Listado de reservas</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="loadBookings" />
        </div>
      </template>

      <pv-column header="Imagen">
        <template #body="{ data }">
          <div class="reservation-image-container flex items-center justify-center rounded-md overflow-hidden border bg-gray-50">
            <img
                v-if="data.roomImage"
                :src="data.roomImage"
                alt="Imagen de habitación"
                class="w-full h-full object-cover"
            />
            <i v-else class="pi pi-image text-gray-400 text-lg"></i>
          </div>
        </template>
      </pv-column>

      <pv-column header="Propiedad">
        <template #body="{ data }">
          <div>
            <p class="font-semibold text-gray-800">{{ data.propertyName }}</p>
            <p class="text-sm text-gray-500">
              Hab. #{{ data.roomNumber }} — {{ data.roomType }}
            </p>
            <p class="text-xs text-gray-400 flex items-center gap-1">
              <i class="pi pi-map-marker text-xs"></i>{{ data.propertyLocation }}
            </p>
          </div>
        </template>
      </pv-column>

      <pv-column header="Fechas">
        <template #body="{ data }">
          <div class="text-sm text-gray-700">
            <i class="pi pi-calendar text-xs mr-1"></i>
            {{ formatDate(data.checkIn) }} → {{ formatDate(data.checkOut) }}
          </div>
        </template>
      </pv-column>

      <pv-column header="Estado">
        <template #body="{ data }">
          <pv-tag :value="data.status" :severity="getStatusSeverity(data.status)" />
        </template>
        </pv-column>

        <pv-column header="Acciones" style="width: 10rem">
          <template #body="{ data }">
            <div class="flex gap-2 justify-end">
              <pv-button
                  v-if="data.status === 'Confirmada' || data.status === 'Pendiente'"
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-sm"
                  @click="confirmDelete(data.id)"
                  :loading="cancellingBooking === data.id"
                  v-tooltip.bottom="'Eliminar reserva'"
              />
              <pv-button
                  v-if="data.status === 'Completada'"
                  icon="pi pi-star"
                  class="p-button-rounded p-button-info p-button-sm"
                  @click="goToReview(data.id)"
                  v-tooltip.bottom="'Dejar reseña'"
              />
            </div>
          </template>
        </pv-column>

        <template #footer>
          <div class="text-sm text-gray-600 text-right">
            Total de reservas: {{ bookings.length }}
          </div>
        </template>
    </pv-data-table>

    <p v-else class="text-center p-6 bg-gray-50 rounded-lg text-gray-600">
      <i class="pi pi-info-circle mr-2"></i> No tienes reservas activas.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import PvButton from "primevue/button";
import PvTag from "primevue/tag";
import PvToast from "primevue/toast";
import PvConfirmDialog from "primevue/confirmdialog";
import PvDataTable from "primevue/datatable";
import PvColumn from "primevue/column";
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue";
import { BookingService } from "../../application/BookingService.js";
import { BookingApiRepository } from "../../infrastructure/repositories/BookingApiRepository.js";
import { PropertyApiRepository } from "../../../property/infrastructure/repositories/PropertyApiRepository.js";

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

const bookingRepository = new BookingApiRepository();
const propertyRepository = new PropertyApiRepository();
const bookingService = new BookingService(bookingRepository, propertyRepository);

const bookings = ref([]);
const loading = ref(true);
const cancellingBooking = ref(null);
const guestId = ref(null);

onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    guestId.value = JSON.parse(storedUser).id;
    await loadBookings();
  } else {
    loading.value = false;
  }
});

async function loadBookings() {
  if (!guestId.value) return;
  loading.value = true;
  try {
    bookings.value = await bookingService.getMyBookings(guestId.value);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar las reservas.",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}

async function confirmDelete(bookingId) {
  confirm.require({
    message: `¿Eliminar la reserva #${bookingId}? Esta acción no se puede deshacer.`,
    header: "Confirmar Eliminación",
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    acceptLabel: "Sí, eliminar",
    rejectLabel: "No",
    accept: async () => {
      cancellingBooking.value = bookingId;
      try {
        await bookingService.cancelMyBooking(bookingId, guestId.value);
        toast.add({
          severity: "success",
          summary: "Éxito",
          detail: "Reserva eliminada.",
          life: 2500,
        });
        await loadBookings();
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo eliminar la reserva.",
          life: 3000,
        });
      } finally {
        cancellingBooking.value = null;
      }
    },
  });
}

function goBack() {
  router.push({ name: "guest-dashboard" });
}

function formatDate(dateString) {
  if (!dateString) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getStatusSeverity(status) {
  switch (status) {
    case "Confirmada":
      return "success";
    case "Pendiente":
      return "warning";
    case "Cancelada":
      return "danger";
    case "Completada":
      return "info";
    default:
      return "secondary";
  }
}

function goToReview(bookingId) {
  router.push({ name: "guest-review-form", query: { bookingId } });
}
</script>

<style scoped>
.text-primary {
  color: var(--primary-color);
}

/* Contenedor de imagen más pequeño y adaptable */
.reservation-image-container {
  width: 100%;
  max-width: 12rem;   /* ≈ 32px de ancho */
  aspect-ratio: 1 / 1; /* Mantiene proporción cuadrada */
  overflow: hidden;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb; /* fondo gris claro para imágenes ausentes */
  border: 1px solid #e5e7eb;
}

/* Imagen pequeña y responsiva */
.reservation-image-container img {
  width: 100%;
  height: auto;
  max-height: 2000px; /* límite visual aproximado solicitado */
  object-fit: cover;
  display: block;
}

/* Ícono por defecto */
.reservation-image-container i {
  font-size: 1.0rem;
  color: #9ca3af;
}
</style>