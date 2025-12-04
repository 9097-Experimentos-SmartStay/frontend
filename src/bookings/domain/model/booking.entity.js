export class Booking {
    /**
     * @param {number} id
     * @param {number} roomId
     * @param {string} guestName
     * @param {string} guestEmail
     * @param {Date} checkInDate
     * @param {Date} checkOutDate
     * @param {string} status
     */
    constructor({ id, roomId, guestName, guestEmail, checkInDate, checkOutDate, status }) {
        this.id = id;
        this.roomId = roomId;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        // La entidad espera recibir objetos Date ya instanciados, no strings
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
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

    isPending() {
        return this.status === 'Pending';
    }

    isConfirmed() {
        return this.status === 'Confirmed';
    }

    isCancelled() {
        return this.status === 'Cancelled';
    }

    isCompleted() {
        return this.status === 'Completed';
    }
}