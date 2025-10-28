/**
 * @interface IBookingRepository
 * @description Interface for Booking Repository
 * @method getBookings(guestId) - Retrieve bookings for a specific guest
 * @method addBooking(bookingData) - Add a new booking
 * @method deleteBooking(bookingId) - Delete a booking by ID
 * @method addReview(reviewData) - Add a review for a booking
 * @throws {Error} If a method is not implemented
 */
export class IBookingRepository {
    getBookings(guestId) { throw new Error("Not implemented: getBookings"); }
    addBooking(bookingData) { throw new Error("Not implemented: addBooking"); }
    deleteBooking(bookingId) { throw new Error("Not implemented: deleteBooking"); }
    addReview(reviewData) { throw new Error("Not implemented: addReview"); }
    // You can add more method signatures as needed
}