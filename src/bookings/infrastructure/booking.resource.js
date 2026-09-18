/**
 * Booking Resource.
 * Represents the raw data structure coming from the API.
 * This acts as the Data Transfer Object (DTO) definition in our Architecture.
 * * @typedef {Object} BookingResource
 * @property {number} id - Unique identifier
 * @property {number} roomId - Room identifier
 * @property {string} guestName - Name of the guest
 * @property {string} guestEmail - Email of the guest
 * @property {string} checkInDate - Calendar day without timezone ("2026-09-28T00:00:00")
 * @property {string} checkOutDate - Calendar day without timezone
 * @property {string} status - Pending | Confirmed | Cancelled | Completed
 * @property {number|null} userId - Guest account that owns the booking (null for desk bookings)
 * @property {string|null} guestProfileId - Linked guest profile, if any
 */

export {}; // Exportamos vacío para que sea un módulo JS válido