import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AnalyticsApi } from '../infrastructure/api/analytics-api.js';
import { AnalyticsAssembler } from '../infrastructure/analytics.assembler.js';

const analyticsApi = new AnalyticsApi();

/**
 * Pinia Store for Analytics Management.
 * Handles state management and business logic for Analytics.
 * @returns {Object} The analytics store composable with state, actions, and computed properties.
 */
export const useAnalyticsStore = defineStore('analytics', () => {

    // --- State ---
    /**
     * @type {import('vue').Ref<Analytics|null>} metrics - The current analytics metrics.
     */
    const metrics = ref(null);
    /**
     * @type {import('vue').Ref<boolean>} loading - Indicates if an operation is in progress.
     */
    const loading = ref(false);
    /**
     * @type {import('vue').Ref<Error|null>} error - The last error encountered.
     */
    const error = ref(null);

    // --- Actions ---

    /**
     * Fetches monthly performance metrics from the API.
     * @returns {Promise<void>}
     */
    async function fetchMonthlyMetrics() {
        loading.value = true;
        try {
            const response = await analyticsApi.getMonthlyPerformance();
            metrics.value = AnalyticsAssembler.toEntityFromResponse(response);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    // --- COMPUTED: Smart Charts (Innovación Visual) ---

    /**
     * Generates data for the revenue line chart with gradient.
     * Mixes historical data (mock) with the real current data from the backend.
     * @type {import('vue').ComputedRef<Object>}
     */
    const revenueChartData = computed(() => {
        const currentRevenue = metrics.value?.totalRevenue || 0;

        return {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Actual'],
            datasets: [
                {
                    label: 'Ingresos ($)',
                    // Simulamos historia y ponemos el dato REAL al final
                    data: [12000, 15000, 18000, 14000, 20000, currentRevenue],
                    fill: true,
                    borderColor: '#3B82F6', // Primary Blue
                    tension: 0.4,
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); // Azul fuerte arriba
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)'); // Transparente abajo
                        return gradient;
                    }
                }
            ]
        };
    });

    /**
     * Generates data for the occupancy pie chart.
     * @type {import('vue').ComputedRef<Object>}
     */
    const occupancyChartData = computed(() => {
        const occupancy = metrics.value?.occupancyRate || 0;
        const vacancy = 100 - occupancy;

        return {
            labels: ['Ocupado', 'Disponible'],
            datasets: [
                {
                    data: [occupancy, vacancy],
                    backgroundColor: ['#10B981', '#E5E7EB'], // Green & Gray
                    hoverBackgroundColor: ['#059669', '#D1D5DB'],
                    borderWidth: 0
                }
            ]
        };
    });

    return {
        metrics,
        loading,
        error,
        fetchMonthlyMetrics,
        revenueChartData,
        occupancyChartData
    };
});