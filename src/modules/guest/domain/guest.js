// src/modules/guest/domain/guest.js

export class Guest {
    constructor(id, name, email, reservations = []) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.reservations = reservations;
    }

    addReservation(booking) {
        this.reservations.push(booking);
    }

    cancelReservation(bookingId) {
        this.reservations = this.reservations.filter(b => b.id !== bookingId);
    }
}
