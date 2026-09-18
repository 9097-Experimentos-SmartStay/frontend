import { DocumentType } from '../model/guest-profile.entity.js';

/** Same value-object rules as the backend (§11). */
export const GuestProfileRuleError = Object.freeze({
    REQUIRED: 'required',
    PHONE_FORMAT: 'phoneFormat',
    DOCUMENT_FORMAT: 'documentFormat',
    ADDRESS_INCOMPLETE: 'addressIncomplete',
});

const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
const DOCUMENT_PATTERNS = Object.freeze({
    [DocumentType.DNI]: /^\d{8}$/,
    [DocumentType.PASSPORT]: /^[A-Za-z0-9]{6,12}$/,
    [DocumentType.FOREIGNER_ID]: /^[A-Za-z0-9]{8,15}$/,
});
const ADDRESS_FIELDS = ['street', 'number', 'city', 'postalCode', 'country'];

const clean = (value) => (value ?? '').toString().trim();

/**
 * A guest completes their profile (POST /guests). The owner is the caller: `userId` is not sent.
 */
export class CreateGuestProfileCommand {
    /**
     * @param {Object} params
     * @param {string} params.firstName
     * @param {string} params.lastName
     * @param {string} params.phone - Required.
     * @param {string} [params.email]
     * @param {number|null} [params.documentType]
     * @param {string} [params.documentNumber]
     * @param {string} [params.street]
     * @param {string} [params.number]
     * @param {string} [params.city]
     * @param {string} [params.postalCode]
     * @param {string} [params.country]
     */
    constructor(params) {
        this.firstName = clean(params.firstName);
        this.lastName = clean(params.lastName);
        this.phone = clean(params.phone).replace(/[\s-]/g, '');
        this.email = clean(params.email);
        this.documentType = params.documentType ?? null;
        this.documentNumber = clean(params.documentNumber);
        for (const field of ADDRESS_FIELDS) this[field] = clean(params[field]);
        Object.freeze(this);
    }

    /** @returns {boolean} */
    get hasAddress() {
        return ADDRESS_FIELDS.some((field) => this[field]);
    }

    /**
     * @returns {Record<string, string>} {@link GuestProfileRuleError} per invalid field.
     */
    validate() {
        const errors = {};
        if (!this.firstName) errors.firstName = GuestProfileRuleError.REQUIRED;
        if (!this.lastName) errors.lastName = GuestProfileRuleError.REQUIRED;
        if (!this.phone) errors.phone = GuestProfileRuleError.REQUIRED;
        else if (!PHONE_PATTERN.test(this.phone)) errors.phone = GuestProfileRuleError.PHONE_FORMAT;
        if (this.documentType != null || this.documentNumber) {
            const pattern = DOCUMENT_PATTERNS[this.documentType];
            if (!pattern) errors.documentType = GuestProfileRuleError.REQUIRED;
            else if (!pattern.test(this.documentNumber)) errors.documentNumber = GuestProfileRuleError.DOCUMENT_FORMAT;
        }
        // The address is all-or-nothing (the postal code is the only optional part).
        if (this.hasAddress) {
            for (const field of ['street', 'number', 'city', 'country']) {
                if (!this[field]) errors[field] = GuestProfileRuleError.ADDRESS_INCOMPLETE;
            }
        }
        return errors;
    }
}
