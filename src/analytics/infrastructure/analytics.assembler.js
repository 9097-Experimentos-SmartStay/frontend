import { Analytics } from '../domain/model/analytics.entity.js';

/**
 * Assembler to convert Analytics Resources into Analytics Domain Entities.
 */
export class AnalyticsAssembler {
    /**
     * Converts a raw Resource into a Domain Entity.
     * @param {import('./resources/analytics.resource.js').AnalyticsResource} resource
     * @returns {Analytics | null} Domain Entity
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;

        return new Analytics({
            totalRevenue: resource.totalRevenue || 0,
            totalBookings: resource.totalBookings || 0,
            occupancyRate: resource.occupancyRate || 0,
            cancelledBookings: resource.cancelledBookings || 0,
            // Transformación clave: String ISO a Objeto Date
            generatedAt: resource.generatedAt ? new Date(resource.generatedAt) : new Date()
        });
    }

    /**
     * Converts an API response containing the resource into an Entity.
     * @param {Object} response - Axios response object
     * @returns {Analytics | null} Domain Entity
     */
    static toEntityFromResponse(response) {
        if (!response.data) return null;
        // Ahora el assembler documentado sabe qué tipo entra y qué tipo sale
        return AnalyticsAssembler.toEntityFromResource(response.data);
    }
}