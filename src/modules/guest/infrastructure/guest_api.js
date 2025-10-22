import axios from "axios";

const API_URL = "http://localhost:3001";

export const guestApi = {
    async fetchProperties() {
        const response = await axios.get(`${API_URL}/properties`);
        return response.data;
    },

    async fetchBookings() {
        const response = await axios.get(`${API_URL}/bookings`);
        return response.data;
    }
};
