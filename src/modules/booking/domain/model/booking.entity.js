// src/modules/booking/domain/booking.js

export class Booking {
    constructor(id, propertyId, guestId, checkIn, checkOut, status, createdAt) {
        this.id = id; // It will be null or undefined when creating a new booking
        this.propertyId = propertyId;
        this.guestId = guestId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        // You can use enums or constants for better management to avoid typos for status confirmed/pending/canceled and in spanish confirmada/pendiente/cancelada
        this.status = status;
        this.createdAt = createdAt || new Date().toISOString();
    }

    // static method to create from raw data (what goes to the repo)
    static create(data) {
        if (!data.propertyId || !data.guestId || !data.checkIn || !data.checkOut) {
            throw new Error("Missing required booking data");
        }
        const status = data.status || 'Confirmada'; // Default status
        const createdAt = data.createdAt || new Date().toISOString();
        return {
            propertyId: data.propertyId,
            guestId: data.guestId,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
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