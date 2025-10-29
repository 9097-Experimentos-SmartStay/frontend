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
    },
    async removeProfileByUserId(userId) { // <-- AÑADIR
        console.log(`API: Deleting profile for user ID: ${userId}`);
        // json-server no soporta DELETE con query params directamente.
        // Opción 1: Obtener perfil y luego borrar por ID (más seguro)
        const profile = await this.fetchProfileByUserId(userId);
        if (profile && profile.id) {
            await axios.delete(`${API_BASE_URL}${PROFILES_ENDPOINT}/${profile.id}`);
            console.log(`API: Deleted profile ID: ${profile.id}`);
        } else {
            console.log(`API: No profile found for user ID ${userId} to delete.`);
        }
        // Opción 2 (Si tu backend lo soportara): await axios.delete(`${API_BASE_URL}${PROFILES_ENDPOINT}`, { params: { user_id: userId } });
    },
    async postProfile(profileData) { // <-- AÑADIR
        console.log(`API: Posting new profile:`, profileData);
        // Asegúrate que user_id sea número si así lo espera tu db/backend
        if (profileData.user_id && typeof profileData.user_id === 'string') {
            profileData.user_id = parseInt(profileData.user_id);
        }
        const res = await axios.post(`${API_BASE_URL}${PROFILES_ENDPOINT}`, profileData);
        return res.data; // Devuelve el perfil creado con su ID
    }
};