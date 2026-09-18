import { defineStore } from 'pinia';
import { ref } from 'vue';
import { BookingApi } from '../infrastructure/api/booking-api.js';
import { BookingAssembler } from '../infrastructure/booking.assembler.js';
import { BookingStatus } from '../domain/model/booking.entity.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const bookingApi = new BookingApi();

/**
 * Pinia Store for Booking Management.
 *
 * GET /bookings is scoped by the backend: a guest receives only their own bookings, staff roles
 * receive every booking (newest first). No client-side filtering by e-mail is needed.
 * Actions that change data re-throw the HTTP error so the view can show the right message.
 */
export const useBookingStore = defineStore('booking', () => {
    /** @type {import('vue').Ref<Array<import('../domain/model/booking.entity.js').Booking>>} */
    const bookings = ref([]);
    /** @type {import('vue').Ref<import('../domain/model/booking.entity.js').Booking|null>} */
    const currentBooking = ref(null);
    const loading = ref(false);
    const error = ref(null);

    function replace(updated) {
        bookings.value = bookings.value.map((booking) => (booking.id === updated.id ? updated : booking));
        if (currentBooking.value?.id === updated.id) currentBooking.value = updated;
    }

    /**
     * Loads the bookings visible to the signed-in user (own bookings for a guest).
     * @returns {Promise<void>}
     */
    async function fetchBookings() {
        loading.value = true;
        error.value = null;
        try {
            bookings.value = BookingAssembler.toEntitiesFromResponse(await bookingApi.getAllBookings());
        } catch (err) {
            reportError('Error fetching bookings', err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * GET /bookings/{id}. 404 also means "not yours" for a guest: currentBooking becomes null.
     * @param {number} id
     * @returns {Promise<import('../domain/model/booking.entity.js').Booking|null>}
     */
    async function fetchBookingById(id) {
        loading.value = true;
        error.value = null;
        try {
            currentBooking.value = BookingAssembler.toEntityFromResponse(await bookingApi.getBookingById(id));
        } catch (err) {
            if (err?.response?.status !== 404) reportError(`Error fetching booking ${id}`, err);
            currentBooking.value = null;
            error.value = err;
        } finally {
            loading.value = false;
        }
        return currentBooking.value;
    }

    /**
     * POST /bookings. 409 = the room is already booked for some of those nights.
     * @param {import('../domain/commands/create-booking.command.js').CreateBookingCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/booking.entity.js').Booking>}
     */
    async function createBooking(command) {
        loading.value = true;
        try {
            const response = await bookingApi.createBooking(BookingAssembler.toCreateResource(command));
            const created = BookingAssembler.toEntityFromResponse(response);
            if (created) bookings.value = [created, ...bookings.value];
            return created;
        } catch (err) {
            reportError('Error creating booking', err);
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * POST /bookings/{id}/cancel → the updated booking.
     * @param {number} id
     * @returns {Promise<void>}
     */
    async function cancelBooking(id) {
        loading.value = true;
        try {
            const updated = BookingAssembler.toEntityFromResponse(await bookingApi.cancelBooking(id));
            const current = bookings.value.find((booking) => booking.id === id) ?? currentBooking.value;
            replace(updated ?? current.withStatus(BookingStatus.CANCELLED));
        } catch (err) {
            reportError('Error cancelling booking', err);
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
        fetchBookings,
        fetchBookingById,
        createBooking,
        cancelBooking,
    };
});
