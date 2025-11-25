// src/bounded-contexts/accommodations/infrastructure/api/room-api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL || 'http://localhost:3000';
const BASE_PATH = '/api/v1/rooms';

export const roomApi = {
    /**
     * Obtener todas las habitaciones
     * @returns {Promise<Array>}
     */
    async getAll() {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}`);
        return res.data;
    },

    /**
     * Obtener habitación por ID
     * @param {number} roomId
     * @returns {Promise<Object>}
     */
    async getById(roomId) {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}/${roomId}`);
        return res.data;
    },

    /**
     * Obtener habitaciones por tipo
     * @param {number} roomTypeId
     * @returns {Promise<Array>}
     */
    async getByType(roomTypeId) {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}?roomTypeId=${roomTypeId}`);
        return res.data;
    },

    /**
     * Crear nueva habitación
     * @param {Object} data - CreateRoomResource
     * @returns {Promise<Object>}
     */
    async create(data) {
        const res = await axios.post(`${API_BASE_URL}${BASE_PATH}`, data);
        return res.data;
    }
};

