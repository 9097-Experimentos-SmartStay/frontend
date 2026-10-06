import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { IotApi } from '../infrastructure/api/iot-api.js';
import { RoomClimateAssembler } from '../infrastructure/room-climate.assembler.js';
import { classifyIotProblem, IotFailureReason } from './iot-failure.js';
import { OperationFailure } from '@/shared/application/operation-failure.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const iotApi = new IotApi();

/** @param {unknown} error @returns {OperationFailure} */
const iotFailure = (error) => OperationFailure.from(error, { classify: classifyIotProblem });

/**
 * Climate of the rooms (US-11 for the guest, US-19 on the operations board).
 *
 * The emulator has no "list" endpoint: there is one state per room, so a board asks for the rooms it
 * shows (`fetchClimateForRooms`) with `Promise.allSettled`, the same way payments do for bookings.
 * Keep the room list short (one hotel at a time) because it is one request per room.
 *
 * When the API does not expose the emulator every call 404s. That is recorded once in `unavailable`
 * so the views render a single "simulation not available" notice instead of one error per room.
 */
export const useClimateStore = defineStore('climate', () => {
    /** @type {import('vue').Ref<Record<number, import('../domain/model/room-climate.js').RoomClimate>>} */
    const climateByRoom = ref({});
    const loading = ref(false);
    const saving = ref(false);
    /** @type {import('vue').Ref<boolean>} True once the API answered that the emulator is not deployed. */
    const unavailable = ref(false);
    /** @type {import('vue').Ref<OperationFailure|null>} */
    const error = ref(null);

    /** @returns {number} Rooms whose board asks for attention (altered hardware, wasted energy, out of band). */
    const roomsNeedingAttention = computed(
        () => Object.values(climateByRoom.value).filter((climate) => climate.needsAttention).length
    );

    function remember(climate) {
        if (!climate) return;
        climateByRoom.value = { ...climateByRoom.value, [climate.roomId]: climate };
    }

    /**
     * @param {OperationFailure} failure
     * @returns {OperationFailure} The same failure, after recording an unavailable emulator.
     */
    function track(failure) {
        if (failure.reason === IotFailureReason.EMULATOR_NOT_AVAILABLE) unavailable.value = true;
        return failure;
    }

    /**
     * @param {number} roomId
     * @returns {import('../domain/model/room-climate.js').RoomClimate|null}
     */
    function climateFor(roomId) {
        return climateByRoom.value[roomId] ?? null;
    }

    /**
     * GET the board of one room. Used by the guest view, which shows the error itself.
     * @param {number} roomId
     * @returns {Promise<import('../domain/model/room-climate.js').RoomClimate|null>}
     * @throws {OperationFailure} emulatorNotAvailable | forbidden | network...
     */
    async function fetchClimate(roomId) {
        loading.value = true;
        error.value = null;
        try {
            const climate = RoomClimateAssembler.toEntityFromResponse(await iotApi.getActuatorsState(roomId), roomId);
            remember(climate);
            return climate;
        } catch (err) {
            reportError(`Error fetching the climate of room ${roomId}`, err);
            const failure = track(iotFailure(err));
            error.value = failure;
            throw failure;
        } finally {
            loading.value = false;
        }
    }

    /**
     * GET the board of several rooms at once (one request each). Rooms that fail are left out and the
     * first real failure is kept in `error`, so the board still shows what it could read.
     * @param {number[]} roomIds
     * @returns {Promise<void>}
     */
    async function fetchClimateForRooms(roomIds) {
        loading.value = true;
        error.value = null;
        try {
            const results = await Promise.allSettled(roomIds.map((id) => iotApi.getActuatorsState(id)));
            const read = {};
            results.forEach((result, index) => {
                if (result.status !== 'fulfilled') return;
                const climate = RoomClimateAssembler.toEntityFromResource(result.value?.data, roomIds[index]);
                if (climate) read[climate.roomId] = climate;
            });
            climateByRoom.value = read;

            const rejected = results.find((result) => result.status === 'rejected');
            if (rejected) {
                reportError('Error fetching the climate of the hotel rooms', rejected.reason);
                error.value = track(iotFailure(rejected.reason));
            }
        } finally {
            loading.value = false;
        }
    }

    /**
     * US-11: sets the target temperature and fan speed of a room; the response is the resulting board.
     * @param {number} roomId
     * @param {import('../domain/commands/set-thermostat.command.js').SetThermostatCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/room-climate.js').RoomClimate|null>}
     * @throws {OperationFailure} emulatorNotAvailable | invalidData | network...
     */
    async function setThermostat(roomId, command) {
        saving.value = true;
        try {
            const response = await iotApi.setThermostat(roomId, RoomClimateAssembler.toThermostatResource(command));
            const climate = RoomClimateAssembler.toEntityFromResponse(response, roomId);
            remember(climate);
            return climate;
        } catch (err) {
            reportError(`Error setting the thermostat of room ${roomId}`, err);
            throw track(iotFailure(err));
        } finally {
            saving.value = false;
        }
    }

    /**
     * Pushes a simulated sensor reading into a room's board (operations board, no physical hardware).
     * @param {import('../domain/commands/inject-telemetry.command.js').InjectTelemetryCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/room-climate.js').RoomClimate|null>}
     * @throws {OperationFailure} emulatorNotAvailable | invalidData | network...
     */
    async function injectTelemetry(command) {
        saving.value = true;
        try {
            const response = await iotApi.injectTelemetry(command.roomId, RoomClimateAssembler.toTelemetryResource(command));
            const climate = RoomClimateAssembler.toEntityFromResponse(response, command.roomId);
            remember(climate);
            return climate;
        } catch (err) {
            reportError(`Error injecting telemetry into room ${command.roomId}`, err);
            throw track(iotFailure(err));
        } finally {
            saving.value = false;
        }
    }

    /** Drops what was read, so a board does not show the rooms of the hotel it was looking at before. */
    function clear() {
        climateByRoom.value = {};
        error.value = null;
    }

    return {
        climateByRoom,
        loading,
        saving,
        unavailable,
        error,
        roomsNeedingAttention,
        climateFor,
        fetchClimate,
        fetchClimateForRooms,
        setThermostat,
        injectTelemetry,
        clear,
    };
});

export default useClimateStore;
