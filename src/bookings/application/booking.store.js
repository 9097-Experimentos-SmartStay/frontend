import { defineStore } from 'pinia';
import { ref } from 'vue';
import { BookingApi } from '../infrastructure/api/booking-api.js';
import { BookingAssembler } from '../infrastructure/booking.assembler.js';

const bookingApi = new BookingApi();

export const useBookingStore = defineStore('booking', () => {

    // --- State ---
    const bookings = ref([]);
    const currentBooking = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // --- Actions ---

    // 1. Obtener todas las reservas
    async function fetchAllBookings() {
        loading.value = true;
        error.value = null;
        try {
            const response = await bookingApi.getAllBookings();
            bookings.value = BookingAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    // 2. Crear reserva
    async function createBooking(bookingData) {
        loading.value = true;
        try {
            // Validaciones de dominio simples
            if (!bookingData.roomId) throw new Error('Room ID required');

            const response = await bookingApi.createBooking(bookingData);
            const newBooking = BookingAssembler.toEntityFromResponse(response);
            if(newBooking) bookings.value.push(newBooking);
            return newBooking;
        } catch (err) {
            console.error('Error creating booking:', err);
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    // 3. Cancelar reserva
    async function cancelBooking(id) {
        loading.value = true;
        try {
            await bookingApi.cancelBooking(id);
            // Actualizamos la lista localmente para reflejar el cambio sin recargar todo
            const index = bookings.value.findIndex(b => b.id === id);
            if (index !== -1) {
                bookings.value[index].status = 'Cancelled';
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        bookings,
        currentBooking,
        loading,
        error,
        fetchAllBookings,
        createBooking,
        cancelBooking
    };
});