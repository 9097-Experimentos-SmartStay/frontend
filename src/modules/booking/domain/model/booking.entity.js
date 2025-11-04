// src/modules/booking/domain/booking.js

export class Booking {
    constructor(id, propertyId, roomId, guestId, checkIn, checkOut, status, totalPrice, createdAt) {
        this.id = id;
        this.propertyId = propertyId;
        this.roomId = roomId;
        this.guestId = guestId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.status = status;
        this.totalPrice = totalPrice; // <-- "ARMA" AÑADIDA
        this.createdAt = createdAt || new Date().toISOString();
    }

    // static method to create from raw data (what goes to the repo)
    static create(data) {
        // --- "JUGADA" MEJORADA ---
        if (!data.propertyId || !data.roomId || !data.guestId || !data.checkIn || !data.checkOut || !data.totalPrice) {
            throw new Error("Missing required booking data (propertyId, roomId, guestId, dates, totalPrice)");
        }
        const status = data.status || 'Confirmada';
        const createdAt = data.createdAt || new Date().toISOString();
        return {
            propertyId: data.propertyId,
            roomId: data.roomId, // <-- "ARMA" AÑADIDA
            guestId: data.guestId,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            totalPrice: data.totalPrice, // <-- "ARMA" AÑADIDA
            status: status,
            createdAt: createdAt
        };
    }

    // You can add more logic here if needed (e.g., calculate duration)
    get durationInDays() {
        const start = new Date(this.checkIn);
        const end = new Date(this.checkOut);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}