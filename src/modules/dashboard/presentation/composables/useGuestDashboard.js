// useGuestDashboard.js
// Lógica (servicios, transformación, acciones) separada del UI
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

// Ajusta rutas a tus servicios reales si difieren
import { BookingService } from "../../../booking/application/BookingService.js";
import { guestService } from "../../../guest/application/guest_service.js";
import { PropertyService } from "../../../property/application/PropertyService.js";

export function useGuestDashboard() {
const router = useRouter();
const toast = useToast();

// services (instanciación)
const bookingSvc = new BookingService();
const guestSvc = new guestService();
const propertySvc = new PropertyService();

// estado
const loading = ref(false);
const upcomingBookings = ref([]);
const properties = ref([]);
const recommendations = ref([]);
const services = ref([]); // servicios contratados
const placeholderImg = "/assets/logo-modo-oscuro.png"; // usa path real si tienes
const userId = ref(null);

// estadisticas simples
const stats = computed(() => ({
upcoming: upcomingBookings.value.length,
services: services.value.length,
}));

/** Formatea fecha a string legible (local) */
function formatDate(dateStr) {
try {
const d = new Date(dateStr);
return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
} catch (e) {
return dateStr;
}
}

function translateBookingStatus(status) {
if (!status) return status;
const s = status.toString().toLowerCase();
if (s.includes("confirm")) return "Confirmada";
if (s.includes("pending") || s.includes("pendiente")) return "Pendiente";
if (s.includes("cancel")) return "Cancelada";
return status;
}

/** Determina si puede cancelar (ej. más de 24h antes del checkin) */
function canCancel(booking) {
if (!booking || !booking.checkIn) return false;
const checkIn = new Date(booking.checkIn).getTime();
const now = Date.now();
const diffHours = (checkIn - now) / (1000 * 60 * 60);
return diffHours > 24 && booking.status && !/cancel/i.test(booking.status);
}

async function loadDashboard() {
loading.value = true;
try {
const stored = localStorage.getItem("user");
userId.value = stored ? JSON.parse(stored).id : null;

// llamadas paralelas
const [bks, props, svc, recs] = await Promise.all([
bookingSvc.getBookingsForGuest(userId.value), // debe devolver lista
propertySvc.getRecommendedPropertiesForGuest(userId.value), // lista
guestSvc.getActiveServices(userId.value), // servicios contratados por el guest
propertySvc.getRecentProperties() // otra source para recomendaciones si no hay
]);

// Normalizar respuestas (depende de tu API)
upcomingBookings.value = Array.isArray(bks) ? bks.filter(b => {
// bookings futuras / activas
const checkOut = new Date(b.checkOut).getTime();
return checkOut >= Date.now();
}).sort((a,b)=> new Date(a.checkIn)-new Date(b.checkIn)) : [];

properties.value = Array.isArray(props) ? props.slice(0, 6) : (Array.isArray(recs) ? recs.slice(0,6) : []);

services.value = Array.isArray(svc) ? svc : [];

// Recomendations: usa recs si provided, si no, recompute
if (Array.isArray(props) && props.length) {
recommendations.value = props.slice(0, 4).map(p => ({
title: p.name,
description: p.location,
propertyId: p.id
}));
} else if (Array.isArray(recs) && recs.length) {
recommendations.value = recs.slice(0, 4).map(p => ({ title: p.name, description: p.location, propertyId: p.id }));
} else {
recommendations.value = [];
}

} catch (error) {
console.error("Error loading guest dashboard:", error);
toast.add({ severity: "error", summary: "Error", detail: error.message || "No se pudieron cargar datos", life: 4000 });
} finally {
loading.value = false;
}
}

/* Navegación */
function goToBookings() {
router.push({ name: "guest-bookings" });
}
function goToProperties() {
router.push({ name: "guest-properties" });
}
function goToProperty(propertyId) {
router.push({ name: "guest-property-details", params: { id: propertyId } });
}
function goToReview() {
router.push({ name: "guest-review" });
}

async function cancelBooking(booking) {
try {
await bookingSvc.cancelBooking(booking.id);
toast.add({ severity: "success", summary: "Éxito", detail: "Reserva cancelada", life: 3000 });
await loadDashboard();
} catch (error) {
console.error("Error cancelling booking:", error);
toast.add({ severity: "error", summary: "Error", detail: error.message || "No se pudo cancelar", life: 4000 });
}
}

function openBooking(booking) {
router.push({ name: "guest-booking-details", params: { id: booking.id } });
}

async function requestService() {
try {
// ejemplo simple: open services page
router.push({ name: "guest-services" });
} catch (error) {
console.error("Request service error:", error);
}
}

function logout() {
localStorage.removeItem("user");
localStorage.removeItem("user_token");
localStorage.removeItem("user_role");
router.push({ name: "login" });
}

function getRoomNumber(roomId) {
// Intenta resolver room number desde properties list
const p = properties.value.find(pr => pr.rooms && pr.rooms.find(r => r.id === roomId));
if (p) {
const r = p.rooms.find(r => r.id === roomId);
return r ? r.number : roomId;
}
return roomId;
}

return {
loading,
upcomingBookings,
properties,
recommendations,
services,
stats,
placeholderImg,

loadDashboard,
logout,
goToBookings,
goToProperties,
goToProperty,
goToReview,
openBooking,
cancelBooking,
requestService,

// helpers
formatDate,
translateBookingStatus,
canCancel,
getRoomNumber
};
}
