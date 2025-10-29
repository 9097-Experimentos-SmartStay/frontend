// src/modules/property/infrastructure/api/PropertyApi.js
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;

const ROOMS_ENDPOINT = import.meta.env.VITE_ROOMS_ENDPOINT_PATH;
const PROPERTIES_ENDPOINT = import.meta.env.VITE_PROPERTIES_ENDPOINT_PATH;
const TASKS_ENDPOINT = import.meta.env.VITE_TASKS_ENDPOINT_PATH;

export const propertyApi = {
    async fetchRooms() {
        const res = await axios.get(`${API_BASE_URL}${ROOMS_ENDPOINT}`);
        return res.data;
    },
    async fetchProperties() {
        const res = await axios.get(`${API_BASE_URL}${PROPERTIES_ENDPOINT}`);
        return res.data;
    },
    async fetchTasks(assignedTo = null) { // Permite filtrar por assignedTo
        const params = assignedTo ? { assignedTo: assignedTo } : {};
        const res = await axios.get(`${API_BASE_URL}${TASKS_ENDPOINT}`, { params });
        return res.data;
    },
    async patchTask(taskId, data) {
        const res = await axios.patch(`${API_BASE_URL}${TASKS_ENDPOINT}/${taskId}`, data);
        return res.data;
    }
    // Añadir llamadas API para otras operaciones (POST, PUT, DELETE)
};