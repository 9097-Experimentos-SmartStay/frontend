/** Card brands the API recognizes (it keeps "Visa ****4242" as the operation number). */
export const CardBrand = Object.freeze({
    VISA: 'Visa',
    MASTERCARD: 'Mastercard',
    AMEX: 'Amex',
    UNKNOWN: 'Card',
});

/** Why the card form is invalid before sending it. */
export const CardPaymentRuleError = Object.freeze({
    NUMBER_REQUIRED: 'numberRequired',
    NUMBER_INVALID: 'numberInvalid',
    HOLDER_REQUIRED: 'holderRequired',
    HOLDER_TOO_LONG: 'holderTooLong',
    EXPIRY_REQUIRED: 'expiryRequired',
    EXPIRY_INVALID: 'expiryInvalid',
    EXPIRED: 'expired',
    CVV_INVALID: 'cvvInvalid',
});

export const CARD_HOLDER_MAX_LENGTH = 100;

/**
 * @param {string} value
 * @returns {string} Only the digits of `value`.
 */
export function onlyDigits(value) {
    return (value ?? '').replace(/\D/g, '');
}

/**
 * Brand from the number prefix, the same rule the API uses.
 * @param {string} digits
 * @returns {string} One of {@link CardBrand}.
 */
export function cardBrandOf(digits) {
    if (/^4/.test(digits)) return CardBrand.VISA;
    if (/^3[47]/.test(digits)) return CardBrand.AMEX;
    const two = Number(digits.slice(0, 2));
    const four = Number(digits.slice(0, 4));
    if ((two >= 51 && two <= 55) || (digits.length >= 4 && four >= 2221 && four <= 2720)) return CardBrand.MASTERCARD;
    return CardBrand.UNKNOWN;
}

/**
 * "4242424242424242" → "4242 4242 4242 4242"; Amex goes 4-6-5 like the card itself.
 * @param {string} digits
 * @returns {string}
 */
export function formatCardNumber(digits) {
    if (cardBrandOf(digits) === CardBrand.AMEX) {
        return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(' ');
    }
    return digits.slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * @param {string} digits
 * @returns {boolean} The Luhn checksum of card numbers holds.
 */
function passesLuhn(digits) {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let digit = Number(digits[digits.length - 1 - i]);
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 === 0;
}

/**
 * The guest pays their own Pending booking online with a card (POST /bookings/{id}/payments/card). There is no
 * amount: it is always the booking total, and an approved charge confirms the booking.
 *
 * The API runs a simulated gateway: no money moves and the card is never stored (the payment keeps only the brand
 * and the last four digits). The rules here are the API's, checked first so the guest sees them field by field.
 */
export class PayWithCardCommand {
    /**
     * @param {Object} params
     * @param {number} params.bookingId
     * @param {string} params.cardNumber - Spaces allowed.
     * @param {string} params.holderName - As printed on the card.
     * @param {string} params.expiry - "MM/YY".
     * @param {string} params.cvv
     */
    constructor({ bookingId, cardNumber, holderName, expiry, cvv }) {
        this.bookingId = Number(bookingId);
        this.cardNumber = onlyDigits(cardNumber);
        this.holderName = (holderName ?? '').trim().replace(/\s+/g, ' ');
        const [month, year] = (expiry ?? '').split('/').map((part) => onlyDigits(part));
        this.expiryMonth = month ? Number(month) : null;
        this.expiryYear = year?.length === 2 ? 2000 + Number(year) : null;
        this.cvv = onlyDigits(cvv);
        Object.freeze(this);
    }

    /** @returns {string} One of {@link CardBrand}. */
    get brand() {
        return cardBrandOf(this.cardNumber);
    }

    /**
     * @param {Date} [now]
     * @returns {Record<string, {code: string, params?: Object}>} Violation per invalid field (empty when valid).
     */
    validate(now = new Date()) {
        const errors = {};

        if (!this.cardNumber) errors.cardNumber = { code: CardPaymentRuleError.NUMBER_REQUIRED };
        else if (this.cardNumber.length < 13 || this.cardNumber.length > 19 || !passesLuhn(this.cardNumber)) {
            errors.cardNumber = { code: CardPaymentRuleError.NUMBER_INVALID };
        }

        if (this.holderName.length < 2) errors.holderName = { code: CardPaymentRuleError.HOLDER_REQUIRED };
        else if (this.holderName.length > CARD_HOLDER_MAX_LENGTH) {
            errors.holderName = { code: CardPaymentRuleError.HOLDER_TOO_LONG, params: { max: CARD_HOLDER_MAX_LENGTH } };
        }

        if (this.expiryMonth == null && this.expiryYear == null) errors.expiry = { code: CardPaymentRuleError.EXPIRY_REQUIRED };
        else if (this.expiryYear == null || !(this.expiryMonth >= 1 && this.expiryMonth <= 12)) {
            errors.expiry = { code: CardPaymentRuleError.EXPIRY_INVALID };
        } else {
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            if (this.expiryYear < year || (this.expiryYear === year && this.expiryMonth < month)) {
                errors.expiry = { code: CardPaymentRuleError.EXPIRED };
            }
        }

        const cvvLength = this.brand === CardBrand.AMEX ? 4 : 3;
        if (this.cvv.length !== cvvLength) errors.cvv = { code: CardPaymentRuleError.CVV_INVALID, params: { length: cvvLength } };

        return errors;
    }
}
