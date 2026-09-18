import axios from 'axios';
import { apiBaseUrl } from '@/shared/infrastructure/config/api-config.js';
import { clearSession, getToken } from '@/shared/infrastructure/session/session-storage.js';

/**
 * The one axios instance used to talk to the SmartStay API.
 *
 * - Request interceptor: adds `Authorization: Bearer <token>` when a session exists.
 * - Response interceptor: a 401 on an authenticated request clears the session and
 *   calls the handler registered with {@link onUnauthorized} (the app redirects to login).
 *   The error is always re-thrown so callers can still react to it.
 */
export const httpClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

let unauthorizedHandler = null;

/**
 * Registers what to do when the API rejects the current session (HTTP 401).
 * Keeps this infrastructure module free of router/store imports.
 * @param {() => void} handler
 */
export function onUnauthorized(handler) {
    unauthorizedHandler = handler;
}

httpClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const sentToken = !!error.config?.headers?.Authorization;

        // Only an authenticated request means "your session is no longer valid".
        // A 401 on sign-in (no token) is a wrong password and is handled by the form.
        if (status === 401 && sentToken) {
            clearSession();
            unauthorizedHandler?.();
        }
        return Promise.reject(error);
    }
);
