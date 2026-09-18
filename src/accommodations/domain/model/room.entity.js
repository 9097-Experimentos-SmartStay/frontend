import { Money } from '@/shared/domain/money.js';
import { RoomStatus } from './room-status.js';

export { RoomStatus };

/**
 * Room Domain Entity.
 * Represents a room within the business logic.
 * @class
 */
export class Room {
    /**
     * Creates an instance of Room.
     * @param {Object} params - The parameters for creating the room.
     * @param {number} params.id - The unique identifier of the room.
     * @param {number} params.hotelId - The identifier of the hotel this room belongs to.
     * @param {number} params.roomTypeId - The identifier of the room type.
     * @param {string} params.roomTypeName - The name of the room type.
     * @param {number} params.price - The price of the room.
     * @param {string} params.description - The description of the room.
     * @param {string[]} params.amenities - The list of amenities for the room.
     * @param {string|null} [params.status] - One of {@link RoomStatus} (null when the API does not send it).
     * @param {string|null} [params.number] - Room number shown to people (US-53), unique in its hotel.
     */
    constructor({ id, hotelId, roomTypeId, roomTypeName, price, description, amenities, status = null, number = null }) {
        /**
         * @property {number} id - The unique identifier of the room.
         */
        this.id = id;
        /**
         * @property {number} hotelId - The identifier of the hotel this room belongs to.
         */
        this.hotelId = hotelId;
        /**
         * @property {number} roomTypeId - The identifier of the room type.
         */
        this.roomTypeId = roomTypeId;
        /**
         * @property {string} roomTypeName - The name of the room type.
         */
        this.roomTypeName = roomTypeName || 'Unknown';
        /**
         * @property {number} price - The price of the room.
         */
        this.price = Number(price) || 0; // Aseguramos que sea número para cálculos
        /**
         * @property {string} description - The description of the room.
         */
        this.description = description || '';
        /**
         * @property {string[]} amenities - The list of amenities for the room.
         */
        this.amenities = amenities || [];
        /**
         * @property {string|null} status - Operational status (Available, Occupied, Cleaning, Maintenance).
         */
        this.status = status;
        /**
         * @property {string|null} number - Room number (US-53). The id is only for URLs.
         */
        this.number = number || null;
    }

    /** @returns {string} The room number; "#id" only for data that has none. */
    get label() {
        return this.number ?? `#${this.id}`;
    }

    /** @returns {Money} Current price per night (new bookings take it; existing bookings keep their snapshot). */
    get pricePerNight() {
        return new Money(this.price);
    }

    /**
     * Checks if the room has a specific amenity.
     * @param {string} amenity - The amenity to check.
     * @returns {boolean} True if the room has the amenity, false otherwise.
     */
    hasAmenity(amenity) {
        if (!amenity) return false;
        return this.amenities.map(a => a.toLowerCase()).includes(amenity.toLowerCase());
    }
}