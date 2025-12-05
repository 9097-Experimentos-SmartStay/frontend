import { defineStore } from 'pinia';
import { ref } from 'vue';
import { BookingApi } from '../infrastructure/api/booking-api.js';
import { BookingAssembler } from '../infrastructure/booking.assembler.js';

const bookingApi = new BookingApi();

/**
 * Pinia Store for Booking Management.
 * Handles state management and business logic for Bookings.
 * @returns {Object} The booking store composable with state and actions.
 */
export const useBookingStore = defineStore('booking', () => {

    // --- State ---
    /**
     * @type {import('vue').Ref<Array<Booking>>} bookings - List of all bookings.
     */
    const bookings = ref([]);
    /**
     * @type {import('vue').Ref<Booking|null>} currentBooking - The currently selected booking.
     */
    const currentBooking = ref(null);
    /**
     * @type {import('vue').Ref<boolean>} loading - Indicates if an operation is in progress.
     */
    const loading = ref(false);
    /**
     * @type {import('vue').Ref<Error|null>} error - The last error encountered.
     */
    const error = ref(null);

    // --- Actions ---

    /**
     * Fetches all bookings from the API and updates state.
     * @returns {Promise<void>}
     */
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

    /**
     * Creates a new booking.
     * @param {Object} bookingData - The data for the new booking.
     * @param {number} bookingData.roomId - The room identifier.
     * @param {string} bookingData.guestName - The guest name.
     * @param {string} bookingData.guestEmail - The guest email.
     * @param {Date} bookingData.checkInDate - The check-in date.
     * @param {Date} bookingData.checkOutDate - The check-out date.
     * @returns {Promise<Booking>} The created booking entity.
     */
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

    /**
     * Cancels a booking by ID.
     * @param {number} id - The unique identifier of the booking to cancel.
     * @returns {Promise<void>}
     */
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