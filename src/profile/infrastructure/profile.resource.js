/**
 * Profile Resource
 * Represents the data transfer object for Profile API responses
 */
export class ProfileResource {
    /**
     * @param {number} id - Profile unique identifier
     * @param {string} fullName - Full name of the profile
     * @param {string} email - Email address
     * @param {string} streetAddress - Full street address
     */
    constructor(id, fullName, email, streetAddress) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.streetAddress = streetAddress;
    }

    /**
     * Creates a ProfileResource instance from API response
     * @param {Object} data - API response data
     * @returns {ProfileResource} ProfileResource instance
     */
    static fromJSON(data) {
        return new ProfileResource(
            data.id || 0,
            data.fullName || '',
            data.email || '',
            data.streetAddress || ''
        );
    }
}

/**
 * Create Profile Resource
 * Represents the data transfer object for creating a new profile
 */
export class CreateProfileResource {
    /**
     * @param {string} firstName - First name
     * @param {string} lastName - Last name
     * @param {string} email - Email address
     * @param {string} street - Street name
     * @param {string} number - Street number
     * @param {string} city - City name
     * @param {string} postalCode - Postal code
     * @param {string} country - Country name
     */
    constructor(firstName, lastName, email, street, number, city, postalCode, country) {
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
     * Converts to plain object for API request
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            street: this.street,
            number: this.number,
            city: this.city,
            postalCode: this.postalCode,
            country: this.country
        };
    }

    /**
     * Creates a CreateProfileResource from form data
     * @param {Object} formData - Form data object
     * @returns {CreateProfileResource} CreateProfileResource instance
     */
    static fromFormData(formData) {
        return new CreateProfileResource(
            formData.firstName || '',
            formData.lastName || '',
            formData.email || '',
            formData.street || '',
            formData.number || '',
            formData.city || '',
            formData.postalCode || '',
            formData.country || ''
        );
    }
}