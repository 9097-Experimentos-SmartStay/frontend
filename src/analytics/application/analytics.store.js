import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AnalyticsApi } from '../infrastructure/api/analytics-api.js';
import { AnalyticsAssembler } from '../infrastructure/analytics.assembler.js';

const analyticsApi = new AnalyticsApi();

export const useAnalyticsStore = defineStore('analytics', () => {

    // --- State ---
    const metrics = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // --- Actions ---

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
     * Genera datos para el gráfico de líneas con gradiente.
     * Mezcla datos históricos (mock) con el dato real actual del backend.
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