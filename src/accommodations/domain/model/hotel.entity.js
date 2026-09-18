import { HotelLocation } from './hotel-location.js';

/**
 * Hotel Domain Entity (HotelResource, §4).
 * @class
 */
export class Hotel {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {number|null} params.hostId - Account that registered the hotel.
     * @param {string} params.name
     * @param {string} params.description
     * @param {HotelLocation} params.location
     * @param {string} params.type - Category ("Hotel", "Resort"...).
     * @param {string} params.photoUrl
     * @param {number} params.basePrice - Lowest room price of the hotel.
     * @param {Array<string>} [params.amenities=[]]
     * @param {number|null} [params.rating] - Null: the backend has no ratings (never invented).
     * @param {boolean} [params.acceptsBookings=true] - False while the hotel has no payment methods (no bookings).
     */
    constructor({ id, hostId = null, name, description, location, type, photoUrl, basePrice, amenities, rating = null, acceptsBookings = true }) {
        this.id = id;
        this.hostId = hostId;
        this.name = name;
        this.description = description;
        this.locationParts = location instanceof HotelLocation ? location : HotelLocation.parse(location);
        this.type = type;
        this.photoUrl = photoUrl;
        this.basePrice = Number(basePrice ?? 0);
        this.amenities = amenities || [];
        this.rating = rating;
        this.acceptsBookings = acceptsBookings !== false;
    }

    /** @returns {string} "{address}, {city}, {country}". */
    get location() {
        return this.locationParts.toString();
    }

    /** @returns {string} */
    get address() {
        return this.locationParts.address;
    }

    /** @returns {string} */
    get city() {
        return this.locationParts.city;
    }

    /** @returns {string} */
    get country() {
        return this.locationParts.country;
    }
}
