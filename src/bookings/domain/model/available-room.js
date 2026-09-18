/**
 * A room free for the whole stay (GET /rooms/available, US-51 scenario 1), with the price per night
 * and the total the booking will have.
 */
export class AvailableRoom {
    /**
     * @param {Object} params
     * @param {number} params.roomId
     * @param {string|null} params.number
     * @param {number} params.hotelId
     * @param {string} params.roomTypeName
     * @param {string} params.description
     * @param {string[]} params.amenities
     * @param {import('@/shared/domain/money.js').Money} params.pricePerNight
     * @param {number} params.nights
     * @param {import('@/shared/domain/money.js').Money} params.total
     * @param {import('./stay-period.js').StayPeriod} params.stay
     */
    constructor({ roomId, number, hotelId, roomTypeName, description, amenities, pricePerNight, nights, total, stay }) {
        this.roomId = roomId;
        this.number = number;
        this.hotelId = hotelId;
        this.roomTypeName = roomTypeName;
        this.description = description;
        this.amenities = Object.freeze([...(amenities ?? [])]);
        this.pricePerNight = pricePerNight;
        this.nights = nights;
        this.total = total;
        this.stay = stay;
        Object.freeze(this);
    }

    /** @returns {string} */
    get label() {
        return this.number || `#${this.roomId}`;
    }
}
