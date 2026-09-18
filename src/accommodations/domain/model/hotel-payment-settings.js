/**
 * How the guests of a hotel pay a Pending booking: the payment methods the hotel administrator configures (US-53).
 * A hotel without any method (Yape, Plin or a bank account) does not accept bookings yet (409
 * `booking.hotel_payment_settings_missing`). Members are null when not set.
 */
export class HotelPaymentSettings {
    /**
     * @param {Object} params
     * @param {number} params.hotelId
     * @param {boolean} params.acceptsBookings - True when at least one method is configured.
     * @param {string|null} [params.accountHolder]
     * @param {string|null} [params.yapeNumber]
     * @param {string|null} [params.plinNumber]
     * @param {string|null} [params.bankName]
     * @param {string|null} [params.bankAccountNumber]
     * @param {string|null} [params.bankAccountCci]
     */
    constructor({ hotelId, acceptsBookings, accountHolder = null, yapeNumber = null, plinNumber = null, bankName = null, bankAccountNumber = null, bankAccountCci = null }) {
        this.hotelId = hotelId;
        this.acceptsBookings = !!acceptsBookings;
        this.accountHolder = accountHolder;
        this.yapeNumber = yapeNumber;
        this.plinNumber = plinNumber;
        this.bankName = bankName;
        this.bankAccountNumber = bankAccountNumber;
        this.bankAccountCci = bankAccountCci;
        Object.freeze(this);
    }

    /** @returns {boolean} */
    get hasBankAccount() {
        return !!(this.bankName && this.bankAccountNumber);
    }
}
