import { IBookingRepository } from "../../domain/IBookingRepository.js";
import { bookingApi } from "../api/BookingApi.js";

export class BookingApiRepository extends IBookingRepository {
    async getBookings(guestId) {
        return await bookingApi.fetchBookings(guestId);
    }
    async addBooking(bookingData) {
        return await bookingApi.postBooking(bookingData);
    }
    async deleteBooking(bookingId) {
        await bookingApi.removeBooking(bookingId);
        return true;
    }
    async addReview(reviewData) {
        return await bookingApi.postReview(reviewData);
    }
    async getAllBookings() { // [NUEVO]
        return await bookingApi.fetchAllBookings();
    }
}