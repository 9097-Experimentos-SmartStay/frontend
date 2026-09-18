/**
 * Required fields of POST/PUT /hotels (§4: every string is required).
 * @param {{name: string, type: string|null, address: string, city: string, country: string, description: string, imageUrl: string}} form
 * @returns {Record<string, 'required'>} Invalid fields (empty when valid).
 */
export function validateHotelForm(form) {
    const errors = {};
    for (const field of ['name', 'type', 'address', 'city', 'country', 'description', 'imageUrl']) {
        if (!form[field] || !String(form[field]).trim()) errors[field] = 'required';
    }
    return errors;
}

/**
 * The address travels inside `location` separated by commas, so the city and country cannot contain commas.
 * @param {{city: string, country: string}} form
 * @returns {Record<string, 'noCommas'>}
 */
export function validateLocationParts(form) {
    const errors = {};
    if (form.city?.includes(',')) errors.city = 'noCommas';
    if (form.country?.includes(',')) errors.country = 'noCommas';
    return errors;
}
