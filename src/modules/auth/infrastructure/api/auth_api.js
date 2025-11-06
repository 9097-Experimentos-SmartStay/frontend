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
    },
    async removeUser(userId) { // <-- AÑADIR
        console.log(`API: Deleting user ID: ${userId}`);
        await axios.delete(`${FULL_USERS_API_URL}/${userId}`);
    },
    async fetchUserById(userId) {
        console.log(`API: Obteniendo user ID: ${userId}`);
        const res = await axios.get(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`);
        return res.data;
    },
    async patchUser(userId, userData) {
        console.log(`API: Actualizando (PATCH) user ID: ${userId}`, userData);
        const res = await axios.patch(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`, userData);
        return res.data;
    }
};