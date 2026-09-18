/**
 * Analytics Domain Entity.
 * Represents performance analytics metrics in the business domain.
 * @class
 */
export class Analytics {
    /**
     * Creates an instance of Analytics.
     * @param {Object} params - The parameters for creating the analytics.
     * @param {number} params.totalRevenue - The total revenue.
     * @param {number} params.totalBookings - The total number of bookings.
     * @param {number} params.occupancyRate - The occupancy rate.
     * @param {number} params.cancelledBookings - The number of cancelled bookings.
     * @param {Date} params.generatedAt - The date when the analytics were generated.
     */
    constructor({ totalRevenue, totalBookings, occupancyRate, cancelledBookings, generatedAt }) {
        /**
         * @property {number} totalRevenue - The total revenue.
         */
        this.totalRevenue = totalRevenue;
        /**
         * @property {number} totalBookings - The total number of bookings.
         */
        this.totalBookings = totalBookings;
        /**
         * @property {number} occupancyRate - The occupancy rate.
         */
        this.occupancyRate = occupancyRate;
        /**
         * @property {number} cancelledBookings - The number of cancelled bookings.
         */
        this.cancelledBookings = cancelledBookings;
        /**
         * @property {Date} generatedAt - The date when the analytics were generated.
         */
        this.generatedAt = generatedAt;
    }

    // Puedes agregar lógica de dominio aquí si la necesitas en el futuro.
    // Por ejemplo:
    // get isPerformanceGood() { return this.occupancyRate > 70; }

    /**
     * Returns formatted revenue string.
     * @returns {string} e.g., "$15,200.50"
     */
    get formattedRevenue() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(this.totalRevenue);
    }
}