/**
 * The only currency SmartStay charges in. The API sends plain decimals (it does not model the currency),
 * but every amount is in Peruvian soles: the hotels are paid by Yape, Plin, bank transfer or at the front desk,
 * and the booking e-mails of the backend print "S/ 255.00".
 */
export const CURRENCY = 'PEN';

const SYMBOLS = Object.freeze({ PEN: 'S/' });

/**
 * Value object for an amount of money (prices per night, booking totals, payments).
 * Amounts are kept with two decimals, like the backend `decimal` fields.
 */
export class Money {
    /**
     * @param {number} amount
     * @param {string} [currency]
     */
    constructor(amount, currency = CURRENCY) {
        this.amount = Math.round(Number(amount) * 100) / 100;
        this.currency = currency;
        Object.freeze(this);
    }

    /**
     * @param {Money|number|string|null|undefined} value
     * @returns {Money|null} Null when the value is missing or not a number.
     */
    static from(value) {
        if (value instanceof Money) return value;
        if (value == null || value === '') return null;
        const amount = Number(value);
        return Number.isFinite(amount) ? new Money(amount) : null;
    }

    /** @returns {Money} */
    static zero() {
        return new Money(0);
    }

    /**
     * @param {number} factor - E.g. the nights of a stay.
     * @returns {Money}
     */
    times(factor) {
        return new Money(this.amount * factor, this.currency);
    }

    /** @returns {boolean} */
    isPositive() {
        return this.amount > 0;
    }

    /**
     * @param {Money|null} other
     * @returns {boolean}
     */
    equals(other) {
        return !!other && other.currency === this.currency && other.amount === this.amount;
    }

    /**
     * The symbol is written by hand: `Intl` prints "PEN" instead of "S/" for most locales ("es", "en").
     * @param {string} locale - Current vue-i18n locale (digit grouping and decimal separator).
     * @returns {string} E.g. "S/ 1,255.00" (en) or "S/ 1255,00" (es), like the backend e-mails.
     */
    format(locale) {
        const digits = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.amount);
        return `${SYMBOLS[this.currency] ?? this.currency} ${digits}`;
    }

    toString() {
        return `${this.currency} ${this.amount.toFixed(2)}`;
    }
}
