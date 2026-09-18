/**
 * Required fields of POST/PUT /rooms (§5). The price is per night and cannot be negative.
 * @param {{hotelId: number|null, roomTypeId: number|null, price: number|null, description: string}} form
 * @returns {Record<string, 'required'|'negativePrice'>}
 */
export function validateRoomForm(form) {
    const errors = {};
    if (form.hotelId == null) errors.hotelId = 'required';
    if (form.roomTypeId == null) errors.roomTypeId = 'required';
    if (form.price == null || form.price === '') errors.price = 'required';
    else if (Number(form.price) < 0) errors.price = 'negativePrice';
    if (!form.description?.trim()) errors.description = 'required';
    return errors;
}
