/** Same rule as the backend: `name@domain.tld`, at most 254 characters (§2.1). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const EMAIL_MAX_LENGTH = 254;

/**
 * Value object for an e-mail address, the login identifier of every account (D4).
 * Always trimmed and lowercased, like the backend stores it.
 */
export class Email {
    /** @param {string} value - A valid e-mail (use {@link Email.isValid} or {@link Email.tryParse} first). */
    constructor(value) {
        if (!Email.isValid(value)) {
            throw new TypeError('Invalid e-mail address');
        }
        this.value = Email.#normalize(value);
        Object.freeze(this);
    }

    /**
     * @param {unknown} value
     * @returns {boolean}
     */
    static isValid(value) {
        if (typeof value !== 'string') return false;
        const normalized = Email.#normalize(value);
        return normalized.length > 0 && normalized.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(normalized);
    }

    /**
     * @param {unknown} value
     * @returns {Email|null}
     */
    static tryParse(value) {
        return Email.isValid(value) ? new Email(value) : null;
    }

    static #normalize(value) {
        return String(value).trim().toLowerCase();
    }

    toString() {
        return this.value;
    }
}
