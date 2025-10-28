// src/modules/auth/infrastructure/api/auth_api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;
const USERS_ENDPOINT = import.meta.env.VITE_USERS_ENDPOINT_PATH ;
const FULL_USERS_API_URL = `${API_BASE_URL}${USERS_ENDPOINT}`;

export const authApi = {
    async register(user) {
        const res = await axios.post(FULL_USERS_API_URL, user);
        return res.data;
    },
    async getUserByEmail(email) {
        const res = await axios.get(FULL_USERS_API_URL, {
            params: { email: email }
        });
        return res.data[0];
    },

    async fetchAllUsers() {
        const res = await axios.get(FULL_USERS_API_URL);
        return res.data; // Devuelve el array completo de usuarios
    }
};