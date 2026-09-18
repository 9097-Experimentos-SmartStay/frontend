/**
 * Booking Domain Entity.
 * Represents a booking in the business domain.
 * @class
 */
export class Booking {
    /**
     * Creates an instance of Booking.
     * @param {Object} params - The parameters for creating the booking.
     * @param {number} params.id - The unique identifier of the booking.
     * @param {number} params.roomId - The identifier of the room being booked.
     * @param {string} params.guestName - The name of the guest.
     * @param {string} params.guestEmail - The email of the guest.
     * @param {Date} params.checkInDate - The check-in date.
     * @param {Date} params.checkOutDate - The check-out date.
     * @param {string} [params.status='Pending'] - The status of the booking.
     */
    constructor({ id, roomId, guestName, guestEmail, checkInDate, checkOutDate, status }) {
        /**
         * @property {number} id - The unique identifier of the booking.
         */
        this.id = id;
        /**
         * @property {number} roomId - The identifier of the room being booked.
         */
        this.roomId = roomId;
        /**
         * @property {string} guestName - The name of the guest.
         */
        this.guestName = guestName;
        /**
         * @property {string} guestEmail - The email of the guest.
         */
        this.guestEmail = guestEmail;
        // La entidad espera recibir objetos Date ya instanciados, no strings
        /**
         * @property {Date} checkInDate - The check-in date.
         */
        this.checkInDate = checkInDate;
        /**
         * @property {Date} checkOutDate - The check-out date.
         */
        this.checkOutDate = checkOutDate;
        /**
         * @property {string} status - The status of the booking.
         */
        this.status = status || 'Pending';
    }

    /**
     * Calculates the duration of the booking in days.
     * @returns {number} Duration in days.
     */
    get durationInDays() {
        if (!this.checkInDate || !this.checkOutDate) {
            return 0;
        }
        const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Checks if the booking is pending.
     * @returns {boolean} True if the status is 'Pending'.
     */
    isPending() {
        return this.status === 'Pending';
    }

    /**
     * Checks if the booking is confirmed.
     * @returns {boolean} True if the status is 'Confirmed'.
     */
    isConfirmed() {
        return this.status === 'Confirmed';
    }

    /**
     * Checks if the booking is cancelled.
     * @returns {boolean} True if the status is 'Cancelled'.
     */
    isCancelled() {
        return this.status === 'Cancelled';
    }

    /**
     * Checks if the booking is completed.
     * @returns {boolean} True if the status is 'Completed'.
     */
    isCompleted() {
        return this.status === 'Completed';
    }
}