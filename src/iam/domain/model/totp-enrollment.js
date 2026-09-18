/**
 * Authenticator app setup data (POST /authentication/mfa/enrollment, §2.6 scenario 1).
 * `otpAuthUri` is rendered as a QR code; `secret` is shown for manual entry.
 */
export class TotpEnrollment {
    /**
     * @param {Object} params
     * @param {string} params.secret - Base32 shared secret.
     * @param {string} params.otpAuthUri - `otpauth://totp/...` URI (what the QR encodes).
     * @param {string} params.issuer
     * @param {string} params.accountName
     * @param {number} params.digits
     * @param {number} params.period - Seconds of each code.
     */
    constructor({ secret, otpAuthUri, issuer, accountName, digits, period }) {
        this.secret = secret;
        this.otpAuthUri = otpAuthUri;
        this.issuer = issuer;
        this.accountName = accountName;
        this.digits = digits;
        this.period = period;
        Object.freeze(this);
    }

    /** @returns {string} The secret in groups of four characters, easier to type into an app. */
    get groupedSecret() {
        return (this.secret ?? '').replace(/(.{4})/g, '$1 ').trim();
    }
}

/**
 * The single-use recovery codes issued when the enrollment is confirmed. The backend shows them ONCE.
 */
export class RecoveryCodes {
    /**
     * @param {string[]} codes
     */
    constructor(codes) {
        this.codes = Object.freeze([...(codes ?? [])]);
        Object.freeze(this);
    }

    /** @returns {boolean} */
    get isEmpty() {
        return this.codes.length === 0;
    }

    /**
     * @param {string} header - First lines of the file (account, date, how to use them).
     * @returns {string} Plain text to copy or download.
     */
    toText(header) {
        return `${header}\n\n${this.codes.join('\n')}\n`;
    }
}
