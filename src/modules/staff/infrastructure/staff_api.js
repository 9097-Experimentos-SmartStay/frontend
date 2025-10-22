import axios from "axios";

const API_URL = "http://localhost:3001";

export const staffApi = {
    async fetchTasks() {
        const response = await axios.get(`${API_URL}/tasks`);
        return response.data;
    },
    async fetchRooms() {
        const response = await axios.get(`${API_URL}/rooms`);
        return response.data;
    }
};
