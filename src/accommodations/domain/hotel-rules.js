/** Field limits of POST/PUT /hotels (§4, US-53 scenario 1). */
export const HOTEL_FIELD_LIMITS = Object.freeze({
    name: { min: 2, max: 100 },
    address: { min: 3, max: 200 },
    city: { min: 2, max: 100 },
    country: { min: 2, max: 100 },
    type: { min: 2, max: 50 },
    description: { min: 1, max: 1000 },
    imageUrl: { min: 1, max: 500 },
});

/** Why a hotel form is invalid (i18n `staffHotels.rules.<code>`). */
export const HotelRuleError = Object.freeze({
    REQUIRED: 'required',
    LENGTH: 'lengthRange',
    TOO_LONG: 'tooLong',
    URL: 'imageUrl',
    NO_COMMAS: 'noCommas',
    /** The API only accepts images uploaded to the SmartStay image library (`hotel.image_url_not_allowed`). */
    IMAGE_NOT_HOSTED: 'imageNotHosted',
});

const HTTP_URL = /^https?:\/\/\S+$/i;

/**
 * Every string is required, with the backend limits; the image is an absolute http(s) URL.
 * @param {{name: string, type: string|null, address: string, city: string, country: string, description: string, imageUrl: string}} form
 * @returns {Record<string, {code: string, params?: Object}>} Violation per invalid field (empty when valid).
 */
export function validateHotelForm(form) {
    const errors = {};
    for (const [field, { min, max }] of Object.entries(HOTEL_FIELD_LIMITS)) {
        const value = String(form[field] ?? '').trim();
        if (!value) errors[field] = { code: HotelRuleError.REQUIRED };
        else if (value.length > max) errors[field] = { code: min > 1 ? HotelRuleError.LENGTH : HotelRuleError.TOO_LONG, params: { min, max } };
        else if (value.length < min) errors[field] = { code: HotelRuleError.LENGTH, params: { min, max } };
    }
    if (!errors.imageUrl && !HTTP_URL.test(String(form.imageUrl).trim())) errors.imageUrl = { code: HotelRuleError.URL };
    return errors;
}

/**
 * The address travels inside `location` separated by commas, so the city and country cannot contain commas.
 * @param {{city: string, country: string}} form
 * @returns {Record<string, {code: string}>}
 */
export function validateLocationParts(form) {
    const errors = {};
    if (form.city?.includes(',')) errors.city = { code: HotelRuleError.NO_COMMAS };
    if (form.country?.includes(',')) errors.country = { code: HotelRuleError.NO_COMMAS };
    return errors;
}
