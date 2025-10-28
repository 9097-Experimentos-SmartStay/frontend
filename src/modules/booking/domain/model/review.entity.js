// src/modules/booking/domain/review.js
export class Review {
    constructor(id, bookingId, guestId, rating, comment, createdAt) {
        this.id = id; // It can be null if new
        this.bookingId = bookingId;
        this.guestId = guestId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt || new Date().toISOString();

        if (this.rating < 1 || this.rating > 5) {
            throw new Error("Rating must be between 1 and 5.");
        }
    }

    // Método estático para crear desde datos crudos
    static create(data) {
        if (!data.bookingId || !data.guestId || !data.comment || data.rating === undefined) {
            throw new Error("Missing required review data");
        }
        if (data.rating < 1 || data.rating > 5) {
            throw new Error("Rating must be between 1 and 5.");
        }
        const createdAt = data.createdAt || new Date().toISOString();

        return {
            bookingId: data.bookingId,
            guestId: data.guestId,
            comment: data.comment,
            rating: data.rating,
            createdAt: createdAt
        };
    }
}