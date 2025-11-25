// src/bounded-contexts/bookings/presentation/composables/useBookings.js
import { ref, onMounted } from 'vue';
import { BookingService } from '../../application/booking-service.js';

export function useBookings() {
    const bookings = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const service = new BookingService();

    const fetchBookings = async () => {
        loading.value = true;
        error.value = null;
        try {
            bookings.value = await service.getAllBookings();
        } catch (err) {
            error.value = err.message || 'Error fetching bookings';
            console.error('Error fetching bookings:', err);
        } finally {
            loading.value = false;
        }
    };

    const getBookingById = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            return await service.getBookingById(id);
        } catch (err) {
            error.value = err.message || 'Error fetching booking';
            console.error('Error fetching booking:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const getBookingsByRoom = async (roomId) => {
        loading.value = true;
        error.value = null;
        try {
            bookings.value = await service.getBookingsByRoom(roomId);
        } catch (err) {
            error.value = err.message || 'Error fetching bookings by room';
            console.error('Error fetching bookings by room:', err);
        } finally {
            loading.value = false;
        }
    };

    const createBooking = async (data) => {
        loading.value = true;
        error.value = null;
        try {
            const newBooking = await service.createBooking(data);
            await fetchBookings(); // Refresh list
            return newBooking;
        } catch (err) {
            error.value = err.message || 'Error creating booking';
            console.error('Error creating booking:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const confirmBooking = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const booking = await service.confirmBooking(id);
            await fetchBookings(); // Refresh list
            return booking;
        } catch (err) {
            error.value = err.message || 'Error confirming booking';
            console.error('Error confirming booking:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const cancelBooking = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const booking = await service.cancelBooking(id);
            await fetchBookings(); // Refresh list
            return booking;
        } catch (err) {
            error.value = err.message || 'Error cancelling booking';
            console.error('Error cancelling booking:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    onMounted(() => {
        fetchBookings();
    });

    return {
        bookings,
        loading,
        error,
        fetchBookings,
        getBookingById,
        getBookingsByRoom,
        createBooking,
        confirmBooking,
        cancelBooking
    };
}

