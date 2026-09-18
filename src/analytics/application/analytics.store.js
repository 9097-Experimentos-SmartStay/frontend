import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AnalyticsApi } from '../infrastructure/api/analytics-api.js';
import { AnalyticsAssembler } from '../infrastructure/analytics.assembler.js';

const analyticsApi = new AnalyticsApi();

/**
 * Pinia Store for Analytics Management.
 * Handles state management and business logic for Analytics.
 * Chart configuration lives in the presentation layer (StaffDashboard.vue).
 * @returns {Object} The analytics store composable with state and actions.
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
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    return {
        metrics,
        loading,
        error,
        fetchMonthlyMetrics
    };
});