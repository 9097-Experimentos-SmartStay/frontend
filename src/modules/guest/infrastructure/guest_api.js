// src/modules/guest/infrastructure/guest_api.js
import axios from "axios";
const API_URL = import.meta.env.VITE_SMARTSTAY_API_URL ;

export const guestApi = {
    async fetchProperties() {
        const res = await axios.get(`${API_URL}/properties`);
        return res.data;
    },

    async fetchBookings() {
        const res = await axios.get(`${API_URL}/bookings`);
        return res.data;
    },

    async fetchServices(guestId) {
        const res = await axios.get(`${API_URL}/services`, { params: { guestId } });
        return res.data;
    }
};
