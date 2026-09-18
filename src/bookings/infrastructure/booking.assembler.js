import { Booking } from '../domain/model/booking.entity.js';
import { BookingCode } from '../domain/model/booking-code.js';
import { StayPeriod } from '../domain/model/stay-period.js';
import { AvailableRoom } from '../domain/model/available-room.js';
import { PaymentInstructions } from '../domain/model/payment-instructions.js';
import { BookingCalendar, CalendarDay } from '../domain/model/booking-calendar.js';
import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { Money } from '@/shared/domain/money.js';

const toInstant = (value) => (value ? new Date(value) : null);

/**
 * BookingResource, AvailableRoomResource and BookingCalendarResource (§5, §8) ↔ domain.
 *
 * Check-in/check-out come back without a timezone ("2026-09-28T00:00:00"): they are read as calendar days,
 * never through `new Date()`. `createdAt`, `paymentDueAt`... are instants with offset.
 */
export class BookingAssembler {
    /**
     * @param {Object} resource - BookingResource or a calendar entry.
     * @returns {Booking|null}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new Booking({
            id: resource.id,
            code: BookingCode.from(resource.code),
            hotelId: resource.hotelId ?? null,
            roomId: resource.roomId,
            roomNumber: resource.roomNumber ?? null,
            guestName: resource.guestName,
            guestEmail: resource.guestEmail,
            guestPhone: resource.guestPhone ?? null,
            stay: new StayPeriod(CalendarDate.from(resource.checkInDate), CalendarDate.from(resource.checkOutDate)),
            pricePerNight: Money.from(resource.pricePerNight),
            total: Money.from(resource.totalPrice),
            status: resource.status,
            createdAt: toInstant(resource.createdAt),
            paymentDueAt: toInstant(resource.paymentDueAt),
            confirmedAt: toInstant(resource.confirmedAt),
            cancelledAt: toInstant(resource.cancelledAt),
            cancellationReason: resource.cancellationReason ?? null,
            userId: resource.userId ?? null,
            paymentInstructions: PaymentInstructions.from(resource.paymentInstructions),
        });
    }

    /**
     * @param {Object} response - Axios response.
     * @returns {Booking[]}
     */
    static toEntitiesFromResponse(response) {
        return Array.isArray(response?.data) ? response.data.map(BookingAssembler.toEntityFromResource) : [];
    }

    /**
     * @param {Object} response - Axios response.
     * @returns {Booking|null}
     */
    static toEntityFromResponse(response) {
        return BookingAssembler.toEntityFromResource(response?.data);
    }

    /**
     * Body of POST /bookings. Dates go as "YYYY-MM-DD". A guest books for themselves (the owner, name and
     * e-mail come from the token); the staff sends the contact of a guest without account.
     * @param {import('../domain/commands/create-booking.command.js').CreateBookingCommand} command
     * @returns {Object}
     */
    static toCreateResource(command) {
        const resource = {
            roomId: command.roomId,
            checkInDate: command.stay.checkIn.toIsoString(),
            checkOutDate: command.stay.checkOut.toIsoString(),
        };
        if (command.guest) {
            resource.guestName = command.guest.name;
            resource.guestEmail = command.guest.email;
            if (command.guest.phone) resource.guestPhone = command.guest.phone;
        }
        return resource;
    }

    /**
     * Body of PATCH /bookings/{id}: only what changed.
     * @param {import('../domain/commands/change-booking.command.js').ChangeBookingCommand} command
     * @returns {Object}
     */
    static toChangeResource(command) {
        const resource = {};
        if (command.datesChanged) {
            resource.checkInDate = command.stay.checkIn.toIsoString();
            resource.checkOutDate = command.stay.checkOut.toIsoString();
        }
        if (command.roomChanged) resource.roomId = command.roomId;
        return resource;
    }

    /**
     * @param {import('../domain/commands/search-availability.query.js').SearchAvailabilityQuery} query
     * @returns {{checkIn: string, checkOut: string, hotelId?: number}}
     */
    static toAvailabilityParams(query) {
        const params = { checkIn: query.stay.checkIn.toIsoString(), checkOut: query.stay.checkOut.toIsoString() };
        if (query.hotelId) params.hotelId = query.hotelId;
        return params;
    }

    /**
     * @param {Object} response - Axios response of GET /rooms/available.
     * @returns {AvailableRoom[]}
     */
    static toAvailableRoomsFromResponse(response) {
        return (Array.isArray(response?.data) ? response.data : []).map((room) => new AvailableRoom({
            roomId: room.id,
            number: room.number ?? null,
            hotelId: room.hotelId,
            roomTypeName: room.roomTypeName ?? '',
            description: room.description ?? '',
            amenities: room.amenities ?? [],
            pricePerNight: Money.from(room.pricePerNight),
            nights: room.nights,
            total: Money.from(room.totalPrice),
            stay: new StayPeriod(CalendarDate.from(room.checkInDate), CalendarDate.from(room.checkOutDate)),
        }));
    }

    /**
     * @param {Object} response - Axios response of GET /bookings/calendar.
     * @returns {BookingCalendar}
     */
    static toCalendarFromResponse(response) {
        const body = response?.data ?? {};
        return new BookingCalendar({
            hotelId: body.hotelId ?? null,
            from: CalendarDate.from(body.from),
            to: CalendarDate.from(body.to),
            bookings: (body.bookings ?? []).map((entry) => BookingAssembler.toEntityFromResource({ ...entry, hotelId: entry.hotelId ?? body.hotelId })),
            days: (body.days ?? []).map((day) => new CalendarDay({
                date: CalendarDate.from(day.date),
                arrivals: day.arrivals,
                departures: day.departures,
                inHouse: day.inHouse,
                occupiedRooms: day.occupiedRooms,
            })),
        });
    }
}
