/** Why the card form is incomplete before sending it. */
export const PaymentRuleError = Object.freeze({
    CARD_HOLDER_REQUIRED: 'cardHolderRequired',
    CARD_NUMBER_INVALID: 'cardNumberInvalid',
    EXPIRATION_INVALID: 'expirationInvalid',
    CVV_INVALID: 'cvvInvalid',
});

/** Luhn checksum, the same `[CreditCard]` check the backend applies. */
function passesLuhn(digits) {
    let sum = 0;
    let double = false;
    for (let i = digits.length - 1; i >= 0; i -= 1) {
        let digit = Number(digits[i]);
        if (double) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        double = !double;
    }
    return digits.length >= 12 && sum % 10 === 0;
}

/**
 * Pays a booking with a (simulated) card. There is NO amount: the backend charges
 * room price per night × nights and returns the amount in the payment.
 */
export class PayBookingCommand {
    /**
     * @param {Object} params
     * @param {number} params.bookingId
     * @param {string} params.cardHolderName
     * @param {string} params.cardNumber - Digits, separators allowed.
     * @param {string} params.expirationDate - "MM/YY".
     * @param {string} params.cvv
     */
    constructor({ bookingId, cardHolderName, cardNumber, expirationDate, cvv }) {
        this.bookingId = Number(bookingId);
        this.paymentMethod = 'Credit Card';
        this.cardHolderName = (cardHolderName ?? '').trim();
        this.cardNumber = (cardNumber ?? '').replace(/\D/g, '');
        this.expirationDate = (expirationDate ?? '').trim();
        this.cvv = (cvv ?? '').trim();
        Object.freeze(this);
    }

    /**
     * @param {Date} [now]
     * @returns {Record<string, string>} {@link PaymentRuleError} per invalid field (empty when valid).
     */
    validate(now = new Date()) {
        const errors = {};
        if (!this.cardHolderName) errors.cardHolderName = PaymentRuleError.CARD_HOLDER_REQUIRED;
        if (!passesLuhn(this.cardNumber)) errors.cardNumber = PaymentRuleError.CARD_NUMBER_INVALID;
        const match = /^(\d{2})\/(\d{2})$/.exec(this.expirationDate);
        const month = match ? Number(match[1]) : 0;
        const year = match ? 2000 + Number(match[2]) : 0;
        const endOfMonth = new Date(year, month, 1);
        if (!match || month < 1 || month > 12 || endOfMonth <= now) errors.expirationDate = PaymentRuleError.EXPIRATION_INVALID;
        if (!/^\d{3,4}$/.test(this.cvv)) errors.cvv = PaymentRuleError.CVV_INVALID;
        return errors;
    }
}
