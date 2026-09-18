import { defineStore } from 'pinia';
import { ref } from 'vue';
import { BookingApi } from '../infrastructure/api/booking-api.js';
import { BookingAssembler } from '../infrastructure/booking.assembler.js';
import { bookingFieldViolations, classifyBookingProblem } from '../infrastructure/booking-problem.assembler.js';
import { OperationFailure } from '@/shared/application/operation-failure.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const bookingApi = new BookingApi();

/** @param {unknown} error @returns {OperationFailure} */
const bookingFailure = (error) => OperationFailure.from(error, { classify: classifyBookingProblem, fields: bookingFieldViolations });

/**
 * Bookings of the signed-in user (US-51) and of the hotel (US-07).
 *
 * The backend scopes every call (a guest sees their own bookings; staff those of their hotel; a chain_admin all),
 * so nothing is filtered here. Actions that change data throw an {@link OperationFailure} with a business reason
 * (room no longer available, paid total rule, check-in day reached...).
 */
export const useBookingStore = defineStore('booking', () => {
    /** @type {import('vue').Ref<import('../domain/model/booking.entity.js').Booking[]>} */
    const bookings = ref([]);
    /** @type {import('vue').Ref<import('../domain/model/booking.entity.js').Booking|null>} */
    const currentBooking = ref(null);
    /** @type {import('vue').Ref<import('../domain/model/available-room.js').AvailableRoom[]>} */
    const availableRooms = ref([]);
    /** @type {import('vue').Ref<import('../domain/commands/search-availability.query.js').SearchAvailabilityQuery|null>} */
    const lastSearch = ref(null);
    /** @type {import('vue').Ref<import('../domain/model/booking-calendar.js').BookingCalendar|null>} */
    const calendar = ref(null);
    const loading = ref(false);
    const searching = ref(false);
    const saving = ref(false);
    const loadingCalendar = ref(false);
    const error = ref(null);

    /** Keeps every copy of a booking in sync after a change. */
    function replace(updated) {
        if (!updated) return;
        const exists = bookings.value.some((booking) => booking.id === updated.id);
        bookings.value = exists
            ? bookings.value.map((booking) => (booking.id === updated.id ? updated : booking))
            : [updated, ...bookings.value];
        if (currentBooking.value?.id === updated.id) currentBooking.value = updated;
    }

    /** @returns {Promise<void>} */
    async function fetchBookings() {
        loading.value = true;
        error.value = null;
        try {
            bookings.value = BookingAssembler.toEntitiesFromResponse(await bookingApi.getAll());
        } catch (err) {
            reportError('Error fetching bookings', err);
            error.value = bookingFailure(err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * GET /bookings/{id}. 404 also means "not yours" (guest) or "not your hotel" (staff): the result is null.
     * @param {number} id
     * @returns {Promise<import('../domain/model/booking.entity.js').Booking|null>}
     */
    async function fetchBookingById(id) {
        loading.value = true;
        error.value = null;
        try {
            currentBooking.value = BookingAssembler.toEntityFromResponse(await bookingApi.getById(id));
        } catch (err) {
            if (err?.response?.status !== 404) reportError(`Error fetching booking ${id}`, err);
            currentBooking.value = null;
            error.value = bookingFailure(err);
        } finally {
            loading.value = false;
        }
        return currentBooking.value;
    }

    /**
     * US-51 scenario 1: rooms free for the whole stay with their price per night and total.
     * @param {import('../domain/commands/search-availability.query.js').SearchAvailabilityQuery} query - Already validated.
     * @returns {Promise<import('../domain/model/available-room.js').AvailableRoom[]>}
     * @throws {OperationFailure} checkInInPast / invalid dates (field `stay`) | network...
     */
    async function searchAvailability(query) {
        searching.value = true;
        lastSearch.value = query;
        try {
            const response = await bookingApi.getAvailableRooms(BookingAssembler.toAvailabilityParams(query));
            availableRooms.value = BookingAssembler.toAvailableRoomsFromResponse(response);
            return availableRooms.value;
        } catch (err) {
            availableRooms.value = [];
            reportError('Error searching available rooms', err);
            throw bookingFailure(err);
        } finally {
            searching.value = false;
        }
    }

    /** Runs the last search again (e.g. after a 409 "no longer available"). */
    async function repeatLastSearch() {
        return lastSearch.value ? searchAvailability(lastSearch.value) : [];
    }

    /** Clears the results of a previous search. */
    function clearSearch() {
        availableRooms.value = [];
        lastSearch.value = null;
    }

    /**
     * POST /bookings: US-51 (guest) or US-07 scenario 2 (staff for a guest without account). Born Pending.
     * @param {import('../domain/commands/create-booking.command.js').CreateBookingCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/booking.entity.js').Booking>}
     * @throws {OperationFailure} roomUnavailable (409) | invalidData (per field) | forbidden (room of another hotel)
     */
    async function createBooking(command) {
        saving.value = true;
        try {
            const created = BookingAssembler.toEntityFromResponse(await bookingApi.create(BookingAssembler.toCreateResource(command)));
            replace(created);
            currentBooking.value = created;
            return created;
        } catch (err) {
            reportError('Error creating booking', err);
            throw bookingFailure(err);
        } finally {
            saving.value = false;
        }
    }

    /**
     * PATCH /bookings/{id} (US-07 scenario 3). The guest is notified by e-mail.
     * @param {import('../domain/commands/change-booking.command.js').ChangeBookingCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/booking.entity.js').Booking>}
     * @throws {OperationFailure} roomUnavailable | paidTotalMismatch | notChangeable | otherHotelRoom | checkInInPast
     */
    async function changeBooking(command) {
        saving.value = true;
        try {
            const updated = BookingAssembler.toEntityFromResponse(await bookingApi.change(command.bookingId, BookingAssembler.toChangeResource(command)));
            replace(updated);
            return updated;
        } catch (err) {
            reportError(`Error changing booking ${command.bookingId}`, err);
            throw bookingFailure(err);
        } finally {
            saving.value = false;
        }
    }

    /**
     * POST /bookings/{id}/cancel (§8.4): releases the nights at once; a paid booking's payment becomes Refunded.
     * @param {number} id
     * @returns {Promise<import('../domain/model/booking.entity.js').Booking>}
     * @throws {OperationFailure} checkInDayReached | notChangeable | notFound
     */
    async function cancelBooking(id) {
        saving.value = true;
        try {
            const updated = BookingAssembler.toEntityFromResponse(await bookingApi.cancel(id));
            replace(updated);
            return updated;
        } catch (err) {
            reportError(`Error cancelling booking ${id}`, err);
            throw bookingFailure(err);
        } finally {
            saving.value = false;
        }
    }

    /**
     * US-07 scenario 1: bookings of a period organized by day (≤ 92 days, `to` excluded).
     * @param {{from: import('@/shared/domain/calendar-date.js').CalendarDate, to: import('@/shared/domain/calendar-date.js').CalendarDate, hotelId?: number|null}} period
     * @returns {Promise<void>}
     * @throws {OperationFailure} forbidden (other hotel) | invalidData
     */
    async function fetchCalendar({ from, to, hotelId = null }) {
        loadingCalendar.value = true;
        try {
            const params = { from: from.toIsoString(), to: to.toIsoString() };
            if (hotelId) params.hotelId = hotelId;
            calendar.value = BookingAssembler.toCalendarFromResponse(await bookingApi.getCalendar(params));
        } catch (err) {
            calendar.value = null;
            reportError('Error fetching the reservations calendar', err);
            throw bookingFailure(err);
        } finally {
            loadingCalendar.value = false;
        }
    }

    /**
     * Reflects a change made by another context (e.g. a registered payment confirms the booking).
     * @param {number} id
     * @returns {Promise<void>}
     */
    async function refreshBooking(id) {
        try {
            replace(BookingAssembler.toEntityFromResponse(await bookingApi.getById(id)));
        } catch (err) {
            reportError(`Error refreshing booking ${id}`, err);
        }
    }

    return {
        bookings,
        currentBooking,
        availableRooms,
        lastSearch,
        calendar,
        loading,
        searching,
        saving,
        loadingCalendar,
        error,
        fetchBookings,
        fetchBookingById,
        searchAvailability,
        repeatLastSearch,
        clearSearch,
        createBooking,
        changeBooking,
        cancelBooking,
        fetchCalendar,
        refreshBooking,
    };
});
