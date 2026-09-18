/** Operational status of a room (US-29). New rooms start Available. */
export const RoomStatus = Object.freeze({
    AVAILABLE: 'Available',
    OCCUPIED: 'Occupied',
    CLEANING: 'Cleaning',
    MAINTENANCE: 'Maintenance',
});

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
     */
    constructor({ id, hotelId, roomTypeId, roomTypeName, price, description, amenities, status = null }) {
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

    /**
     * Returns the formatted price.
     * @returns {string} The price formatted as currency, e.g., "$150.00".
     */
    get formattedPrice() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.price);
    }
}