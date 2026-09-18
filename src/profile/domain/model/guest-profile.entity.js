/** `documentType` is an integer in the API (§11). */
export const DocumentType = Object.freeze({
    DNI: 0,
    PASSPORT: 1,
    FOREIGNER_ID: 2,
});

/**
 * Guest profile (GuestProfileResource, §11): personal data of a guest, linked to their account by `userId`.
 * Name and address come as discrete fields; nothing is rebuilt by splitting strings.
 */
export class GuestProfile {
    /**
     * @param {Object} params
     * @param {string} params.id - GUID.
     * @param {number|null} params.userId
     * @param {string} params.firstName
     * @param {string} params.lastName
     * @param {string|null} params.email
     * @param {string|null} params.phone
     * @param {number|null} params.documentType - One of {@link DocumentType}.
     * @param {string|null} params.documentNumber
     * @param {string|null} params.street
     * @param {string|null} params.number
     * @param {string|null} params.city
     * @param {string|null} params.postalCode
     * @param {string|null} params.country
     * @param {string} params.status - 'Active' | 'Inactive'.
     */
    constructor({ id, userId, firstName, lastName, email, phone, documentType, documentNumber, street, number, city, postalCode, country, status }) {
        this.id = id;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.street = street;
        this.number = number;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
        this.status = status;
    }

    /** @returns {string} */
    get fullName() {
        return [this.firstName, this.lastName].filter(Boolean).join(' ');
    }

    /** @returns {string} */
    get initials() {
        return `${this.firstName?.charAt(0) ?? ''}${this.lastName?.charAt(0) ?? ''}`.toUpperCase();
    }

    /** @returns {boolean} The address is all-or-nothing in the backend. */
    get hasAddress() {
        return !!(this.street && this.city && this.country);
    }

    /** @returns {string} "Street 100, Lima 15001, Peru" or ''. */
    get fullAddress() {
        if (!this.hasAddress) return '';
        const streetLine = [this.street, this.number].filter(Boolean).join(' ');
        const cityLine = [this.city, this.postalCode].filter(Boolean).join(' ');
        return [streetLine, cityLine, this.country].join(', ');
    }

    /** @returns {boolean} */
    get isActive() {
        return this.status === 'Active';
    }
}
