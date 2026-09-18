/**
 * Reservations calendar of a hotel (GET /bookings/calendar, US-07 scenario 1): the active bookings (Pending,
 * Confirmed, CheckedIn) that hold a night in the period, and one entry per day with its arrivals, departures and
 * guests in house. Ids of the days point to the bookings.
 */
export class BookingCalendar {
    /**
     * @param {Object} params
     * @param {number|null} params.hotelId
     * @param {import('@/shared/domain/calendar-date.js').CalendarDate} params.from
     * @param {import('@/shared/domain/calendar-date.js').CalendarDate} params.to - Excluded.
     * @param {import('./booking.entity.js').Booking[]} params.bookings
     * @param {CalendarDay[]} params.days
     */
    constructor({ hotelId, from, to, bookings, days }) {
        this.hotelId = hotelId;
        this.from = from;
        this.to = to;
        this.bookings = Object.freeze([...bookings]);
        this.days = Object.freeze([...days]);
        this.byId = new Map(bookings.map((booking) => [booking.id, booking]));
        Object.freeze(this);
    }

    /**
     * @param {import('@/shared/domain/calendar-date.js').CalendarDate} date
     * @returns {CalendarDay|null}
     */
    dayOf(date) {
        return this.days.find((day) => day.date.equals(date)) ?? null;
    }

    /**
     * Bookings to show on a day: the guests in house that night plus the departures of the morning.
     * @param {import('@/shared/domain/calendar-date.js').CalendarDate} date
     * @returns {import('./booking.entity.js').Booking[]}
     */
    bookingsOn(date) {
        const day = this.dayOf(date);
        if (!day) return [];
        const ids = new Set([...day.inHouse, ...day.arrivals, ...day.departures]);
        return [...ids].map((id) => this.byId.get(id)).filter(Boolean)
            .sort((a, b) => a.roomLabel.localeCompare(b.roomLabel, undefined, { numeric: true }));
    }
}

/** One day of the calendar. */
export class CalendarDay {
    /**
     * @param {Object} params
     * @param {import('@/shared/domain/calendar-date.js').CalendarDate} params.date
     * @param {number[]} params.arrivals - Booking ids that check in that day.
     * @param {number[]} params.departures - Booking ids that check out that day.
     * @param {number[]} params.inHouse - Booking ids that hold that night.
     * @param {number} params.occupiedRooms
     */
    constructor({ date, arrivals, departures, inHouse, occupiedRooms }) {
        this.date = date;
        this.arrivals = Object.freeze([...(arrivals ?? [])]);
        this.departures = Object.freeze([...(departures ?? [])]);
        this.inHouse = Object.freeze([...(inHouse ?? [])]);
        this.occupiedRooms = occupiedRooms ?? 0;
        Object.freeze(this);
    }

    /**
     * @param {number} bookingId
     * @returns {boolean}
     */
    isArrival(bookingId) {
        return this.arrivals.includes(bookingId);
    }

    /**
     * @param {number} bookingId
     * @returns {boolean}
     */
    isDeparture(bookingId) {
        return this.departures.includes(bookingId);
    }
}
