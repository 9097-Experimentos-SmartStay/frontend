// src/modules/dashboard/application/useGuestDashboard.js
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";

import { BookingService } from "../../booking/application/BookingService.js";
import { BookingApiRepository } from "../../booking/infrastructure/repositories/BookingApiRepository.js";
import { PropertyApiRepository } from "../../property/infrastructure/repositories/PropertyApiRepository.js";
import { PropertyService } from "../../property/application/PropertyService.js";
import { guestService } from "../../guest/application/guest_service.js";

export function useGuestDashboard() {
    const router = useRouter();
    const toast = useToast();
    const { t } = useI18n();

    const bookingRepository = new BookingApiRepository();
    const propertyRepository = new PropertyApiRepository();

    const bookingSvc = new BookingService(bookingRepository, propertyRepository);
    const guestSvc = guestService;
    const propertySvc = new PropertyService(propertyRepository);

    const loading = ref(true);
    const upcomingBookings = ref([]);
    const properties = ref([]);
    const recommendations = ref([]);
    const stats = ref({ upcoming: 0, services: 0 });
    const placeholderImg = "/placeholder.jpg";

    async function loadDashboard() {
        loading.value = true;
        try {
            const guestId = 1; // temporal: reemplazar con ID real del usuario autenticado
            const [bookings, props] = await Promise.all([
                bookingSvc.getMyBookings(guestId),
                propertySvc.getAllProperties()
            ]);
            upcomingBookings.value = bookings;
            properties.value = props;
            stats.value.upcoming = bookings.length;
            stats.value.services = 2;
        } catch (err) {
            console.error("❌ Error loading dashboard:", err);
            toast.add({
                severity: "error",
                summary: "Error",
                detail: "Error cargando el panel del huésped"
            });
        } finally {
            loading.value = false;
        }
    }

    function goToProperties() {
        router.push("/guest/properties");
    }
    function goToBookings() {
        router.push("/guest/bookings");
    }
    function goToReview() {
        router.push("/guest/review");
    }
    function logout() {
        router.push("/login");
    }

    onMounted(loadDashboard);

    return {
        t,
        loading,
        upcomingBookings,
        properties,
        recommendations,
        stats,
        placeholderImg,
        loadDashboard,
        goToProperties,
        goToBookings,
        goToReview,
        logout
    };
}
