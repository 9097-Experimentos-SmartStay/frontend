// src/bounded-contexts/bookings/domain/model/booking.entity.js

export class Booking {
    constructor({ id, roomId, guestName, guestEmail, checkInDate, checkOutDate, status }) {
        this.id = id;
        this.roomId = roomId;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.checkInDate = checkInDate ? new Date(checkInDate) : null;
        this.checkOutDate = checkOutDate ? new Date(checkOutDate) : null;
        this.status = status || 'Pending';
    }

    static fromResource(resource) {
        return new Booking({
            id: resource.id,
            roomId: resource.roomId,
            guestName: resource.guestName,
            guestEmail: resource.guestEmail,
            checkInDate: resource.checkInDate,
            checkOutDate: resource.checkOutDate,
            status: resource.status
        });
    }

    get durationInDays() {
        if (!this.checkInDate || !this.checkOutDate) {
            return 0;
        }
        const start = new Date(this.checkInDate);
        const end = new Date(this.checkOutDate);
        const diffTime = Math.abs(end - start);
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

