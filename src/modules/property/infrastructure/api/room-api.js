// src/modules/property/infrastructure/api/room-api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;
const ROOMS_ENDPOINT = import.meta.env.VITE_ROOMS_ENDPOINT_PATH;

export const roomApi = {
    async fetchAll() {
        const res = await axios.get(`${API_BASE_URL}${ROOMS_ENDPOINT}`);
        return res.data;
    },

    async fetchById(id) {
        const res = await axios.get(`${API_BASE_URL}${ROOMS_ENDPOINT}/${id}`);
        return res.data;
    },

    async postRoom(data) {
        const res = await axios.post(`${API_BASE_URL}${ROOMS_ENDPOINT}`, data);
        return res.data;
    },

    async patchRoom(id, data) {
        const res = await axios.patch(`${API_BASE_URL}${ROOMS_ENDPOINT}/${id}`, data);
        return res.data;
    },

    async removeRoom(id) {
        await axios.delete(`${API_BASE_URL}${ROOMS_ENDPOINT}/${id}`);
    }
};
