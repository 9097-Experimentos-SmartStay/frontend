// src/modules/auth/infrastructure/api/auth_api.js
import axios from 'axios';

// Get base URL and endpoint path from environment variables
const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;
const USERS_ENDPOINT = import.meta.env.VITE_USERS_ENDPOINT_PATH ;

// Construct the full URL for the users resource
const FULL_USERS_API_URL = `${API_BASE_URL}${USERS_ENDPOINT}`;

export const authApi = {
    async register(user) {
        // Use the constructed full URL
        const res = await axios.post(FULL_USERS_API_URL, user);
        return res.data;
    },
    async getUserByEmail(email) {
        // Use the constructed full URL and add query params
        const res = await axios.get(FULL_USERS_API_URL, {
            params: { email: email } // Axios handles query string formation
        });
        // json-server returns an array for queries, get the first element
        return res.data[0];
    }
};