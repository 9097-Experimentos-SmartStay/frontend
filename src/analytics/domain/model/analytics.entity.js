/**
 * Domain Entity representing performance analytics metrics.
 */
export class Analytics {
    /**
     * @param {Object} params
     * @param {number} params.totalRevenue
     * @param {number} params.totalBookings
     * @param {number} params.occupancyRate
     * @param {number} params.cancelledBookings
     * @param {Date} params.generatedAt
     */
    constructor({ totalRevenue, totalBookings, occupancyRate, cancelledBookings, generatedAt }) {
        this.totalRevenue = totalRevenue;
        this.totalBookings = totalBookings;
        this.occupancyRate = occupancyRate;
        this.cancelledBookings = cancelledBookings;
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