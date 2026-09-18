import { httpClient } from "@/shared/infrastructure/http/http-client.js";

/**
 * Base class for the API classes of each bounded context.
 * Every subclass shares the same configured HTTP client (base URL, auth header, 401 handling).
 */
export class BaseApi {
    get http() {
        return httpClient;
    }
}
