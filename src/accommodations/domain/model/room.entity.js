/**
 * Room Domain Entity.
 * Represents a room within the business logic.
 */
export class Room {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {number} params.hotelId
     * @param {number} params.roomTypeId
     * @param {string} params.roomTypeName
     * @param {number} params.price
     * @param {string} params.description
     * @param {string[]} params.amenities
     */
    constructor({ id, hotelId, roomTypeId, roomTypeName, price, description, amenities }) {
        this.id = id;
        this.hotelId = hotelId;
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName || 'Unknown';
        this.price = Number(price) || 0; // Aseguramos que sea número para cálculos
        this.description = description || '';
        this.amenities = amenities || [];
    }

    /**
     * Checks if the room has a specific amenity.
     * @param {string} amenity - The amenity to check.
     * @returns {boolean}
     */
    hasAmenity(amenity) {
        if (!amenity) return false;
        return this.amenities.map(a => a.toLowerCase()).includes(amenity.toLowerCase());
    }

    /**
     * Returns the formatted price.
     * @returns {string} e.g. "$150.00"
     */
    get formattedPrice() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.price);
    }
}