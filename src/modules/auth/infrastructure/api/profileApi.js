// src/modules/auth/infrastructure/api/profile_api.js
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;
const PROFILES_ENDPOINT = import.meta.env.VITE_PROFILES_ENDPOINT_PATH;

export const profileApi = {
    // Obtener un perfil específico por user_id
    async fetchProfileByUserId(userId) {
        const res = await axios.get(`${API_BASE_URL}${PROFILES_ENDPOINT}`, {
            params: { user_id: userId } // Filtra por user_id
        });
        return res.data[0]; // Devuelve el primer resultado (debería ser único)
    },
    // Obtener TODOS los perfiles (para combinar con usuarios)
    async fetchAllProfiles() {
        const res = await axios.get(`${API_BASE_URL}${PROFILES_ENDPOINT}`);
        return res.data;
    }
    // Puedes añadir aquí updateProfile, etc.
};