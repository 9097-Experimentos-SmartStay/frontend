/**
 * Profile Entity
 * Represents a user profile in the system
 */
export class Profile {
    /**
     * @param {number} id - Profile unique identifier
     * @param {string} firstName - First name
     * @param {string} lastName - Last name
     * @param {string} email - Email address
     * @param {string} street - Street name
     * @param {string} number - Street number
     * @param {string} city - City name
     * @param {string} postalCode - Postal code
     * @param {string} country - Country name
     */
    constructor(id, firstName, lastName, email, street, number, city, postalCode, country) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.street = street;
        this.number = number;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
    }

    /**
     * Gets the full name
     * @returns {string} Full name
     */
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    /**
     * Gets the full address
     * @returns {string} Full formatted address
     */
    get fullAddress() {
        return `${this.street} ${this.number}, ${this.city}, ${this.postalCode}, ${this.country}`;
    }

    /**
     * Creates a Profile instance from a plain object
     * @param {Object} data - Plain object with profile data
     * @returns {Profile} Profile instance
     */
    static fromJSON(data) {
        return new Profile(
            data.id || 0,
            data.firstName || '',
            data.lastName || '',
            data.email || '',
            data.street || '',
            data.number || '',
            data.city || '',
            data.postalCode || '',
            data.country || ''
        );
    }

    /**
     * Converts the profile to a plain object
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            street: this.street,
            number: this.number,
            city: this.city,
            postalCode: this.postalCode,
            country: this.country,
            fullName: this.fullName,
            fullAddress: this.fullAddress
        };
    }
}