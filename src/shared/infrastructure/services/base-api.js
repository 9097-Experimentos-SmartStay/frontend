import axios from "axios";

const platformApi = import.meta.env.VITE_SMARTSTAY_API_URL;

/**
 * BaseApi class providing a configured Axios instance.
 * Implements the Interceptor pattern to inject the Authorization Bearer Token
 * into every request automatically.
 */
export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.#http.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');

                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    get http() {
        return this.#http;
    }
}