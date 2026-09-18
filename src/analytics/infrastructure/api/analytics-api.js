import { BaseApi } from "@/shared/infrastructure/services/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/services/base-endpoint.js";
import { endpoints } from "@/shared/infrastructure/config/api-config.js";

const analyticsEndpointPath = endpoints.analytics;

export class AnalyticsApi extends BaseApi {
    #endpoint;

    constructor() {
        super();
        // BaseEndpoint no tiene 'getMonthly', así que usaremos axios directo (this.http)
        this.#endpoint = new BaseEndpoint(this, analyticsEndpointPath);
    }

    /**
     * Obtiene las métricas de rendimiento del mes actual.
     * GET /api/v1/analytics/performance/monthly
     */
    getMonthlyPerformance() {
        return this.http.get(`${analyticsEndpointPath}/performance/monthly`);
    }
}