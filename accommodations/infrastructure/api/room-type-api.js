// src/bounded-contexts/accommodations/infrastructure/api/room-type-api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL || 'http://localhost:3000';
const BASE_PATH = '/api/v1/roomTypes';

export const roomTypeApi = {
    /**
     * Obtener todos los tipos de habitación
     * @returns {Promise<Array>}
     */
    async getAll() {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}`);
        return res.data;
    },

    /**
     * Obtener tipo de habitación por ID
     * @param {number} roomTypeId
     * @returns {Promise<Object>}
     */
    async getById(roomTypeId) {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}/${roomTypeId}`);
        return res.data;
    },

    /**
     * Crear nuevo tipo de habitación
     * @param {Object} data - CreateRoomTypeResource
     * @returns {Promise<Object>}
     */
    async create(data) {
        const res = await axios.post(`${API_BASE_URL}${BASE_PATH}`, data);
        return res.data;
    }
};

