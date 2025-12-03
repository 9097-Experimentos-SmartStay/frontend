// src/bounded-contexts/bookings/domain/types/booking.types.js

/**
 * @typedef {Object} BookingResource
 * @property {number} id
 * @property {number} roomId
 * @property {string} guestName
 * @property {string} guestEmail
 * @property {string} checkInDate - ISO 8601 DateTime
 * @property {string} checkOutDate - ISO 8601 DateTime
 * @property {string} status - "Pending" | "Confirmed" | "Cancelled" | "Completed"
 */

/**
 * @typedef {Object} CreateBookingResource
 * @property {number} roomId
 * @property {string} guestName
 * @property {string} guestEmail
 * @property {string} checkInDate - ISO 8601 DateTime
 * @property {string} checkOutDate - ISO 8601 DateTime
 */

export const BookingStatus = {
    Pending: 'Pending',
    Confirmed: 'Confirmed',
    Cancelled: 'Cancelled',
    Completed: 'Completed'
};

export {};

