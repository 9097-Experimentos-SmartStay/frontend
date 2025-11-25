// src/bounded-contexts/payments/infrastructure/api/payment-api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL || 'http://localhost:3000';
const BASE_PATH = '/api/v1/payments';

export const paymentApi = {
    /**
     * Obtener todos los pagos
     * @returns {Promise<Array>}
     */
    async getAll() {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}`);
        return res.data;
    },

    /**
     * Obtener pago por ID
     * @param {number} paymentId
     * @returns {Promise<Object>}
     */
    async getById(paymentId) {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}/${paymentId}`);
        return res.data;
    },

    /**
     * Obtener pagos por reserva
     * @param {number} bookingId
     * @returns {Promise<Array>}
     */
    async getByBookingId(bookingId) {
        const res = await axios.get(`${API_BASE_URL}${BASE_PATH}/booking/${bookingId}`);
        return res.data;
    },

    /**
     * Crear nuevo pago
     * @param {Object} data - CreatePaymentResource
     * @returns {Promise<Object>}
     */
    async create(data) {
        const res = await axios.post(`${API_BASE_URL}${BASE_PATH}`, data);
        return res.data;
    },

    /**
     * Procesar pago
     * @param {number} paymentId
     * @param {string|null} invoiceNumber - Opcional
     * @returns {Promise<Object>}
     */
    async process(paymentId, invoiceNumber = null) {
        const params = invoiceNumber ? { invoiceNumber } : {};
        const res = await axios.post(`${API_BASE_URL}${BASE_PATH}/${paymentId}/process`, null, { params });
        return res.data;
    },

    /**
     * Marcar pago como fallido
     * @param {number} paymentId
     * @returns {Promise<Object>}
     */
    async fail(paymentId) {
        const res = await axios.post(`${API_BASE_URL}${BASE_PATH}/${paymentId}/fail`);
        return res.data;
    }
};

