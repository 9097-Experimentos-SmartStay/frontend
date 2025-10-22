import axios from 'axios';

const API_URL = 'http://localhost:3001/users'; // JSON Server

export const authApi = {
    async register(user) {
        const res = await axios.post(API_URL, user);
        return res.data;
    },
    async getUserByEmail(email) {
        const res = await axios.get(`${API_URL}?email=${email}`);
        return res.data[0];
    }
};



