import axios from "axios";

const API_URL = "http://localhost:3001";

export const adminApi = {
    async fetchStaff() {
        const response = await axios.get(`${API_URL}/staff`);
        return response.data;
    },
    async fetchRooms() {
        const response = await axios.get(`${API_URL}/rooms`);
        return response.data;
    }
};
