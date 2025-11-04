// src/modules/dashboard/application/useGuestDashboard.js

import { ref, computed, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useUserStore } from "../../../../shared/application/store/user_store.js";

// [IMPORTANTE] Necesitamos los repositorios para instanciar los servicios
import { BookingApiRepository } from "../../../booking/infrastructure/repositories/BookingApiRepository.js";
import { PropertyApiRepository } from "../../../property/infrastructure/repositories/PropertyApiRepository.js";
import { guestApi } from "../../../guest/infrastructure/guest_api.js"; // Asumiendo esta ruta

// Ajusta rutas a tus servicios reales
import { BookingService } from "../../../booking/application/booking_service.js";
import { guestService } from "../../../guest/application/guest_service.js";
import { PropertyService } from "../../../property/application/PropertyService.js";

export function useGuestDashboard() {
    const router = useRouter();
    const toast = useToast();
    const userStore = useUserStore();

    // [CORREGIDO] Instanciación de servicios con Repositorios (Estilo DDD)
    const propertyRepo = new PropertyApiRepository();
    const bookingRepo = new BookingApiRepository();
    const guestRepo = new guestApi(); // Asumiendo esto

    const bookingSvc = new BookingService(bookingRepo, propertyRepo);
    const guestSvc = new guestService(guestRepo); // Asumiendo esto
    const propertySvc = new PropertyService(propertyRepo);

    // estado
    const loading = ref(false);
    const upcomingBookings = ref([]);
    const properties = ref([]); // <-- Esto ahora será "Recent Properties"
    const recommendations = ref([]);
    const services = ref([]);
    const placeholderImg = "/assets/logo-modo-oscuro.png";
    const userId = ref(null);

    // estadisticas simples
    const stats = computed(() => ({
        upcoming: upcomingBookings.value.length,
        services: services.value.length,
    }));

    // ... (tus helpers: formatDate, translateBookingStatus, canCancel se quedan igual) ...
    function formatDate(dateStr) { /* ... */ }
    function translateBookingStatus(status) { /* ... */ }
    function canCancel(booking) { /* ... */ }


    async function loadDashboard() {
        loading.value = true;
        try {
            const stored = localStorage.getItem("user");
            userId.value = stored ? JSON.parse(stored).id : null;
            if (!userId.value) throw new Error("User ID not found in localStorage");

            // [TÁCTICA MODIFICADA]
            // 1. Carga las reservas del usuario Y todas las propiedades/habitaciones
            const [userBookings, allProperties, allRooms, activeServices] = await Promise.all([
                bookingSvc.getMyBookings(userId.value), // Solo las del Guest
                propertySvc.getPropertyList(), // Todas las propiedades
                propertySvc.getRoomList(), // Todas las habitaciones (para imágenes)
                guestSvc.getActiveServices(userId.value)
            ]);

            // 2. Procesa las reservas (para "Upcoming Bookings")
            upcomingBookings.value = (Array.isArray(userBookings) ? userBookings : [])
                .filter(b => new Date(b.checkOut) >= Date.now()) // Activas o futuras
                .map(b => {
                    // Enriquece la reserva con el nombre de la propiedad
                    const prop = allProperties.find(p => p.id === b.propertyId);
                    return { ...b, propertyName: prop ? prop.name : 'Propiedad Desconocida' };
                })
                .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

            // 3. Procesa las "Propiedades Recientes" (Tu petición)
            //    (Basado en las reservas del usuario)
            properties.value = (Array.isArray(userBookings) ? userBookings : [])
                // Ordena por fecha de creación (la más nueva primero)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                // Mapea la reserva a un objeto de "Propiedad"
                .map(booking => {
                    const prop = allProperties.find(p => p.id === booking.propertyId);
                    const room = allRooms.find(r => r.id === booking.roomId);
                    return {
                        id: booking.propertyId, // ID de la propiedad para el enlace
                        name: prop ? prop.name : 'Propiedad Desconocida',
                        location: prop ? prop.location : 'Ubicación Desconocida',
                        image_url: room ? room.image_url : null // ¡Tomamos la imagen de la HABITACIÓN!
                    };
                })
                // Elimina duplicados (si reservó el mismo hotel varias veces)
                .filter((prop, index, self) =>
                    index === self.findIndex((p) => p.id === prop.id)
                )
                // Limita a las 3 más recientes
                .slice(0, 3);

            services.value = Array.isArray(activeServices) ? activeServices : [];

            // 4. Recomendaciones (Lógica simple: propiedades que NO ha reservado)
            const bookedPropertyIds = new Set(userBookings.map(b => b.propertyId));
            recommendations.value = allProperties
                .filter(p => !bookedPropertyIds.has(p.id)) // Filtra las que ya reservó
                .slice(0, 4) // Toma las primeras 4
                .map(p => ({
                    title: p.name,
                    description: p.location,
                    propertyId: p.id
                }));

        } catch (error) {
            console.error("Error loading guest dashboard:", error);
            toast.add({ severity: "error", summary: "Error", detail: error.message || "No se pudieron cargar datos", life: 4000 });
        } finally {
            loading.value = false;
        }
    }

    /* Navegación */
    function goToBookings() {
        router.push({ name: "guest-my-bookings" }); // Asumiendo este nombre de ruta
    }
    function goToProperties() {
        router.push({ name: "guest-property-list" }); // Asumiendo este nombre de ruta
    }
    function goToProperty(propertyId) {
        // Necesitas una ruta para detalles de propiedad
        // router.push({ name: "guest-property-details", params: { id: propertyId } });
        console.log("Navegar a detalles de propiedad:", propertyId);
    }
    function goToReview() {
        router.push({ name: "guest-review-form" }); // Asumiendo este nombre de ruta
    }

    async function cancelBooking(booking) {
        try {
            await bookingSvc.cancelMyBooking(booking.id, userId.value);
            toast.add({ severity: "success", summary: "Éxito", detail: "Reserva cancelada", life: 3000 });
            await loadDashboard(); // Recarga todo
        } catch (error) {
            console.error("Error cancelling booking:", error);
            toast.add({ severity: "error", summary: "Error", detail: error.message || "No se pudo cancelar", life: 4000 });
        }
    }

    function openBooking(booking) {
        // Necesitas una ruta para detalles de reserva
        // router.push({ name: "guest-booking-details", params: { id: booking.id } });
        console.log("Navegar a detalles de reserva:", booking.id);
    }

    async function requestService() {
        console.log("Request service...");
    }

    // [TÁCTICA DE LOGOUT QUE FUNCIONA]
    function logout() {
        console.log("GuestDashboard.js: Coordinating logout...");
        userStore.logout(); // Limpia Pinia
        localStorage.clear(); // Limpia localStorage (Síncrono)
        console.log("GuestDashboard.js: State cleared. Navigating to login.");
        router.replace({ name: "login" }); // Navega
    }

    function getRoomNumber(roomId) {
        // Esta función ahora no es necesaria en "Upcoming Bookings" si mostramos el nombre de la propiedad,
        // pero la dejamos por si acaso.
        return `ID ${roomId}`;
    }

    return {
        loading,
        upcomingBookings,
        properties, // Esta es tu lista de "Recent Properties"
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