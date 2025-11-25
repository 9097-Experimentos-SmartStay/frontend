// src/bounded-contexts/bookings/infrastructure/api/booking-api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL || 'http://localhost:3000';
const BASE_PATH = '/api/v1/bookings';

export const bookingApi = {
    /**
     * Obtener todas las reservas
     * @returns {Promise<Array>}
     */
    async getAll() {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}`);
        return res.data;
    },

    /**
     * Obtener reserva por ID
     * @param {number} bookingId
     * @returns {Promise<Object>}
     */
    async getById(bookingId) {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}/${bookingId}`);
        return res.data;
    },

    /**
     * Obtener reservas por habitación
     * @param {number} roomId
     * @returns {Promise<Array>}
     */
    async getByRoomId(roomId) {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}?roomId=${roomId}`);
        return res.data;
    },

    /**
     * Crear nueva reserva
     * @param {Object} data - CreateBookingResource
     * @returns {Promise<Object>}
     */
    async create(data) {
        const res = await axios.post(`${API_BASE_URL}${BASE_PATH}`, data);
        return res.data;
    },

    /**
     * Confirmar reserva
     * @param {number} bookingId
     * @returns {Promise<Object>}
     */
    async confirm(bookingId) {
        // Usar PATCH para actualizar el status a Confirmed
        const res = await axios.patch(`${API_BASE_URL}${BASE_PATH}/${bookingId}`, { status: 'Confirmed' });
        return res.data;
    },

    /**
     * Cancelar reserva
     * @param {number} bookingId
     * @returns {Promise<Object>}
     */
    async cancel(bookingId) {
        // Usar PATCH para actualizar el status a Cancelled
        const res = await axios.patch(`${API_BASE_URL}${BASE_PATH}/${bookingId}`, { status: 'Cancelled' });
        return res.data;
    }
};

