/**
 * Human-readable code of a booking (`SS-` + 8 characters, §8). The guest quotes it when paying and it is what
 * guests and staff use to talk about a booking; the numeric id is only for URLs.
 */
export class BookingCode {
    /**
     * @param {string} value
     */
    constructor(value) {
        this.value = String(value ?? '').trim().toUpperCase();
        Object.freeze(this);
    }

    /**
     * @param {string|null|undefined} value
     * @returns {BookingCode|null}
     */
    static from(value) {
        return value ? new BookingCode(value) : null;
    }

    /**
     * @param {BookingCode|null} other
     * @returns {boolean}
     */
    equals(other) {
        return !!other && other.value === this.value;
    }

    toString() {
        return this.value;
    }
}
