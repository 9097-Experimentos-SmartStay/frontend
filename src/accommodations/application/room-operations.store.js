import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RoomApi } from '../infrastructure/api/room-api.js';
import { RoomOperationsAssembler } from '../infrastructure/room-operations.assembler.js';
import { classifyAccommodationProblem } from '../infrastructure/accommodation-problem.assembler.js';
import { OperationFailure } from '@/shared/application/operation-failure.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const roomApi = new RoomApi();

/** @param {unknown} error @returns {OperationFailure} */
const operationsFailure = (error) => OperationFailure.from(error, { classify: classifyAccommodationProblem });

/**
 * Daily room operations of a hotel (US-06): the room map, status changes and the status history.
 * Reception, housekeeping, maintenance and admin work on their hotel; a chain_admin picks the hotel.
 * Each status change notifies the staff in charge of the new status by e-mail (backend).
 */
export const useRoomOperationsStore = defineStore('room-operations', () => {
    /** @type {import('vue').Ref<import('../domain/model/room-map.js').RoomMap|null>} */
    const roomMap = ref(null);
    const loadingMap = ref(false);
    /** @type {import('vue').Ref<import('../domain/model/room-map.js').RoomStatusChange[]>} */
    const history = ref([]);
    const loadingHistory = ref(false);
    const changingStatus = ref(false);

    /**
     * @param {number|null} hotelId - Null: the hotel of the signed-in staff member.
     * @returns {Promise<void>}
     * @throws {OperationFailure} forbidden (other hotel) | invalidData (chain_admin without hotel) | notFound
     */
    async function fetchMap(hotelId = null) {
        loadingMap.value = true;
        try {
            roomMap.value = RoomOperationsAssembler.toMapFromResponse(await roomApi.getMap(hotelId));
        } catch (error) {
            roomMap.value = null;
            reportError('Error fetching the room map', error);
            throw operationsFailure(error);
        } finally {
            loadingMap.value = false;
        }
    }

    /**
     * US-06 scenario 1: changes the status of a room (one of its allowed next statuses) and reloads the map,
     * which brings the new "since" time and the next allowed statuses.
     * @param {number} roomId
     * @param {string} status
     * @returns {Promise<void>}
     * @throws {OperationFailure} invalidStatusTransition (someone changed it meanwhile) | forbidden | notFound
     */
    async function changeStatus(roomId, status) {
        changingStatus.value = true;
        try {
            await roomApi.changeStatus(roomId, status);
        } catch (error) {
            reportError(`Error changing the status of room ${roomId}`, error);
            throw operationsFailure(error);
        } finally {
            changingStatus.value = false;
        }
        await fetchMap(roomMap.value?.hotelId ?? null);
    }

    /**
     * US-06 scenario 3: who changed the status of a room, when, and from → to (newest first).
     * @param {number} roomId
     * @returns {Promise<void>}
     */
    async function fetchHistory(roomId) {
        loadingHistory.value = true;
        history.value = [];
        try {
            history.value = RoomOperationsAssembler.toHistoryFromResponse(await roomApi.getStatusHistory(roomId));
        } catch (error) {
            reportError(`Error fetching the history of room ${roomId}`, error);
            throw operationsFailure(error);
        } finally {
            loadingHistory.value = false;
        }
    }

    return { roomMap, loadingMap, history, loadingHistory, changingStatus, fetchMap, changeStatus, fetchHistory };
});
