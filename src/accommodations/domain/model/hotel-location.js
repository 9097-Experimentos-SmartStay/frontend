/**
 * Value object for the address of a hotel.
 *
 * The API receives `address`, `city` and `country` separately but returns only
 * `location = "{address}, {city}, {country}"` (§4). The address itself may contain commas,
 * so the string is split from the right: last part = country, the one before = city, the rest = address.
 */
export class HotelLocation {
    /**
     * @param {Object} params
     * @param {string} params.address
     * @param {string} params.city
     * @param {string} params.country
     */
    constructor({ address = '', city = '', country = '' }) {
        this.address = address.trim();
        this.city = city.trim();
        this.country = country.trim();
        Object.freeze(this);
    }

    /**
     * @param {string|null|undefined} location - "{address}, {city}, {country}".
     * @returns {HotelLocation}
     */
    static parse(location) {
        const parts = (location ?? '').split(',').map((part) => part.trim());
        if (parts.length < 3) return new HotelLocation({ address: parts.join(', ') });
        const country = parts.pop();
        const city = parts.pop();
        return new HotelLocation({ address: parts.join(', '), city, country });
    }

    /** @returns {boolean} The three parts the API requires are present. */
    get isComplete() {
        return !!(this.address && this.city && this.country);
    }

    /** @returns {string} Same format as the API `location`. */
    toString() {
        return [this.address, this.city, this.country].filter(Boolean).join(', ');
    }
}
