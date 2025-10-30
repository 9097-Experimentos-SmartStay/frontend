import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;

const BOOKINGS_ENDPOINT = import.meta.env.VITE_BOOKINGS_ENDPOINT_PATH;
const REVIEWS_ENDPOINT = import.meta.env.VITE_REVIEWS_ENDPOINT_PATH ;

export const bookingApi = {
    async fetchBookings(guestId = null) {
        const params = guestId ? { guestId: guestId } : {};
        console.log(`API: Fetching bookings with params:`, params);
        const res = await axios.get(`${API_BASE_URL}${BOOKINGS_ENDPOINT}`, { params });
        return res.data;
    },
    async postBooking(bookingData) {
        console.log(`API: Posting new booking:`, bookingData);
        const res = await axios.post(`${API_BASE_URL}${BOOKINGS_ENDPOINT}`, bookingData);
        return res.data;
    },
    async removeBooking(bookingId) {
        console.log(`API: Deleting booking ID: ${bookingId}`);
        await axios.delete(`${API_BASE_URL}${BOOKINGS_ENDPOINT}/${bookingId}`);
    },
    async postReview(reviewData) {
        console.log(`API: Posting new review:`, reviewData);
        const res = await axios.post(`${API_BASE_URL}${REVIEWS_ENDPOINT}`, reviewData);
        return res.data;
    },
    async fetchAllBookings() { // [NUEVO]
        console.log(`API: Fetching all bookings`);
        const res = await axios.get(`${API_BASE_URL}${BOOKINGS_ENDPOINT}`);
        return res.data;
    }
    // TODO: add call to put and patch is you needed to update appointments or reviews
};