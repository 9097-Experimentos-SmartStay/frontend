/**
 * How the guest pays a Pending booking: the payment methods of its hotel (US-51 scenario 2), as the API sends
 * them with the booking (`paymentInstructions`, only while it is Pending). Members are null when the hotel did not
 * set that method.
 */
export class PaymentInstructions {
    /**
     * @param {Object} params
     * @param {string|null} params.accountHolder
     * @param {string|null} [params.yapeNumber]
     * @param {string|null} [params.plinNumber]
     * @param {string|null} [params.bankName]
     * @param {string|null} [params.bankAccountNumber]
     * @param {string|null} [params.bankAccountCci]
     */
    constructor({ accountHolder, yapeNumber = null, plinNumber = null, bankName = null, bankAccountNumber = null, bankAccountCci = null }) {
        this.accountHolder = accountHolder ?? null;
        this.yapeNumber = yapeNumber || null;
        this.plinNumber = plinNumber || null;
        this.bankName = bankName || null;
        this.bankAccountNumber = bankAccountNumber || null;
        this.bankAccountCci = bankAccountCci || null;
        Object.freeze(this);
    }

    /** @returns {boolean} */
    get hasBankTransfer() {
        return !!this.bankAccountNumber;
    }

    /**
     * @param {Object|null|undefined} resource - `paymentInstructions` of a BookingResource.
     * @returns {PaymentInstructions|null}
     */
    static from(resource) {
        return resource ? new PaymentInstructions(resource) : null;
    }
}
