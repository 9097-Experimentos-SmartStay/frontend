import axios from "axios";

const platformApi = import.meta.env.VITE_BLUE_LOCK_API_URL;

export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
        });
    }
    get http() {
        return this.#http;
    }
}