import { Booking } from '../domain/model/booking.entity.js';
import { CalendarDate } from '@/shared/domain/calendar-date.js';

/**
 * BookingResource (§8) ↔ {@link Booking}.
 * @class
 */
export class BookingAssembler {
    /**
     * Dates come back without timezone ("2026-09-28T00:00:00"): they are read as calendar days,
     * never through `new Date()`, so the day does not shift with the browser timezone.
     * @param {Object} resource
     * @returns {Booking|null}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new Booking({
            id: resource.id,
            roomId: resource.roomId,
            guestName: resource.guestName,
            guestEmail: resource.guestEmail,
            checkInDate: CalendarDate.from(resource.checkInDate),
            checkOutDate: CalendarDate.from(resource.checkOutDate),
            status: resource.status,
            userId: resource.userId ?? null,
            guestProfileId: resource.guestProfileId ?? null,
        });
    }

    /**
     * @param {Object} response - Axios response.
     * @returns {Booking[]}
     */
    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response?.data)) return [];
        return response.data.map(BookingAssembler.toEntityFromResource);
    }

    /**
     * @param {Object} response - Axios response.
     * @returns {Booking|null}
     */
    static toEntityFromResponse(response) {
        return BookingAssembler.toEntityFromResource(response?.data);
    }

    /**
     * Body of POST /bookings. Dates go as "YYYY-MM-DD" (calendar days).
     * A guest always books for themselves: the owner (and a missing name/e-mail) comes from the token.
     * @param {import('../domain/commands/create-booking.command.js').CreateBookingCommand} command
     * @returns {Object}
     */
    static toCreateResource(command) {
        const resource = {
            roomId: command.roomId,
            checkInDate: command.checkInDate.toIsoString(),
            checkOutDate: command.checkOutDate.toIsoString(),
        };
        if (command.guestName) resource.guestName = command.guestName;
        if (command.guestEmail) resource.guestEmail = command.guestEmail;
        return resource;
    }
}
