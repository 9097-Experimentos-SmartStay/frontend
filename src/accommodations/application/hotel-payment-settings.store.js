import { defineStore } from 'pinia';
import { ref } from 'vue';
import { HotelApi } from '../infrastructure/api/hotel-api.js';
import { HotelPaymentSettingsAssembler, paymentSettingsFieldViolations } from '../infrastructure/hotel-payment-settings.assembler.js';
import { classifyAccommodationProblem } from '../infrastructure/accommodation-problem.assembler.js';
import { OperationFailure } from '@/shared/application/operation-failure.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const hotelApi = new HotelApi();

/** @param {unknown} error @returns {OperationFailure} */
const settingsFailure = (error) => OperationFailure.from(error, { classify: classifyAccommodationProblem, fields: paymentSettingsFieldViolations });

/**
 * Payment methods of the hotels (US-53): what the administrator configures so guests know how to pay, and whether
 * each hotel accepts bookings (it needs at least one method). Shared by the settings page and the warning banner.
 */
export const useHotelPaymentSettingsStore = defineStore('hotelPaymentSettings', () => {
    /** @type {import('vue').Ref<Record<number, import('../domain/model/hotel-payment-settings.js').HotelPaymentSettings>>} */
    const settingsByHotel = ref({});
    const loading = ref(false);
    const saving = ref(false);

    /**
     * GET /hotels/{id}/payment-settings.
     * @param {number} hotelId
     * @returns {Promise<import('../domain/model/hotel-payment-settings.js').HotelPaymentSettings>}
     * @throws {OperationFailure} forbidden | notFound | network | ...
     */
    async function load(hotelId) {
        loading.value = true;
        try {
            const settings = HotelPaymentSettingsAssembler.toEntityFromResponse(await hotelApi.getPaymentSettings(hotelId));
            settingsByHotel.value = { ...settingsByHotel.value, [hotelId]: settings };
            return settings;
        } catch (error) {
            reportError(`Error fetching the payment methods of hotel ${hotelId}`, error);
            throw settingsFailure(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * PUT /hotels/{id}/payment-settings with the whole form (validated by the caller with the same rules).
     * @param {number} hotelId
     * @param {Object} form
     * @returns {Promise<import('../domain/model/hotel-payment-settings.js').HotelPaymentSettings>}
     * @throws {OperationFailure} invalidData (field violations, `methods`) | forbidden | notFound | ...
     */
    async function save(hotelId, form) {
        saving.value = true;
        try {
            const response = await hotelApi.updatePaymentSettings(hotelId, HotelPaymentSettingsAssembler.toUpdateResource(form));
            const settings = HotelPaymentSettingsAssembler.toEntityFromResponse(response);
            settingsByHotel.value = { ...settingsByHotel.value, [hotelId]: settings };
            return settings;
        } catch (error) {
            reportError(`Error saving the payment methods of hotel ${hotelId}`, error);
            throw settingsFailure(error);
        } finally {
            saving.value = false;
        }
    }

    /**
     * @param {number|null} hotelId
     * @returns {boolean|null} Whether the hotel accepts bookings; null while unknown.
     */
    function acceptsBookings(hotelId) {
        const settings = hotelId == null ? null : settingsByHotel.value[hotelId];
        return settings ? settings.acceptsBookings : null;
    }

    return { settingsByHotel, loading, saving, load, save, acceptsBookings };
});
