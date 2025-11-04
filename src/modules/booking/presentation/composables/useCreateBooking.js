// src/modules/booking/presentation/composables/useCreateBooking.js
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { PropertyService } from '../../../property/application/PropertyService.js';
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js';
import { BookingService } from '../../application/BookingService.js';
import { BookingApiRepository } from '../../infrastructure/repositories/BookingApiRepository.js';

// Pequeña "arma" de ayuda para no repetir localStorage
function getGuestId() {
    const storedUser = localStorage.getItem('user'); // Asumiendo que guardas 'user'
    return storedUser ? JSON.parse(storedUser).id : null;
}

export function useCreateBooking() {
    // --- "Armas" ---
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    // --- Servicios ---
    const propertyRepo = new PropertyApiRepository();
    const propertySvc = new PropertyService(propertyRepo);
    const bookingRepo = new BookingApiRepository();
    const bookingSvc = new BookingService(bookingRepo, propertyRepo);

    // --- "Estado del Jugador" ---
    const property = ref(null);
    const room = ref(null);
    const dates = ref(null); // Para el <pv-calendar>
    const loading = ref(true);
    const isBooking = ref(false); // Para el loader del botón
    const error = ref(null);

    const { propertyId, roomId } = route.params;

    // --- "Visión Espacial" (Cargar Datos) ---
    onMounted(async () => {
        try {
            if (!propertyId || !roomId) throw new Error("Faltan IDs de propiedad o habitación.");

            // "Pase" simultáneo para buscar el "campo" y el "jugador"
            const [propData, roomData] = await Promise.all([
                propertySvc.getPropertyById(propertyId),
                propertySvc.getRoomDetails(roomId) // Asumiendo que getRoomDetails usa el 'roomApi'
            ]);

            if (!propData || !roomData) throw new Error("No se pudo encontrar la propiedad o la habitación.");

            property.value = propData;
            room.value = roomData;

        } catch (err) {
            console.error("Error loading booking details:", err);
            error.value = "No se pudieron cargar los detalles. Intenta de nuevo.";
            toast.add({ severity: 'error', summary: 'Error', detail: error.value, life: 3000 });
        } finally {
            loading.value = false;
        }
    });

    // --- "Cálculo de Tiro" (Computadas) ---
    const bookingSummary = computed(() => {
        if (!dates.value || !dates.value[0] || !dates.value[1] || !room.value) {
            return { numNights: 0, totalPrice: 0.00 };
        }

        const checkIn = new Date(dates.value[0]);
        const checkOut = new Date(dates.value[1]);

        // Cálculo de noches (diferencia en milisegundos)
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const numNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (numNights <= 0) return { numNights: 0, totalPrice: 0.00 };

        const totalPrice = numNights * room.value.price;
        return { numNights, totalPrice: totalPrice.toFixed(2) };
    });

    // --- "Disparo a Gol" (La Acción) ---
    async function handleBooking() {
        if (!bookingSummary.value.numNights > 0 || !property.value || !room.value) {
            toast.add({ severity: 'warn', summary: 'Faltan datos', detail: 'Por favor, selecciona un rango de fechas válido.', life: 3000 });
            return;
        }

        const guestId = getGuestId();
        if (!guestId) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo identificar al usuario. Por favor, vuelve a iniciar sesión.', life: 3000 });
            return;
        }

        isBooking.value = true;

        const bookingDetails = {
            propertyId: property.value.id,
            roomId: room.value.id,
            guestId: guestId,
            checkInDate: dates.value[0].toISOString(),
            checkOutDate: dates.value[1].toISOString(),
            totalPrice: parseFloat(bookingSummary.value.totalPrice)
        };

        try {
            await bookingSvc.bookProperty(bookingDetails);
            toast.add({ severity: 'success', summary: '¡Éxito!', detail: 'Tu reserva ha sido confirmada.', life: 3000 });

            // "Celebración": Ir a la lista de "Mis Reservas"
            router.push({ name: 'guest-my-bookings' });

        } catch (err) {
            console.error("Error creating booking:", err);
            toast.add({ severity: 'error', summary: 'Error al Reservar', detail: err.message || 'No se pudo completar la reserva.', life: 3000 });
        } finally {
            isBooking.value = false;
        }
    }

    return {
        property,
        room,
        dates,
        loading,
        isBooking,
        error,
        bookingSummary,
        handleBooking,
        minDate: new Date() // Para deshabilitar fechas pasadas en el calendario
    };
}