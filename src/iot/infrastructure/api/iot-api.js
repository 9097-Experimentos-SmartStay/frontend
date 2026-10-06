import { BaseApi } from '@/shared/infrastructure/services/base-api.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';

const basePath = endpoints.iotEmulator;

/**
 * Room IoT emulator (`IoTEmulatorController`): the virtual Cisco board of each room.
 *
 * The emulator keeps one state per room in memory and answers every room id, so `actuators-state`
 * never 404s for a room that exists. A 404 therefore means the emulator is not deployed in this API,
 * which the store turns into a "simulation not available" reason instead of a generic error.
 */
export class IotApi extends BaseApi {
    /**
     * GET /io-t-emulator/rooms/{roomId}/actuators-state → 200 EmulatedRoomState.
     * @param {number} roomId
     */
    getActuatorsState(roomId) {
        return this.http.get(`${basePath}/rooms/${roomId}/actuators-state`);
    }

    /**
     * POST /io-t-emulator/rooms/{roomId}/thermostat → 200 with the resulting state.
     * @param {number} roomId
     * @param {{targetTemperatureCelsius: number, fanSpeed: string}} resource
     */
    setThermostat(roomId, resource) {
        return this.http.post(`${basePath}/rooms/${roomId}/thermostat`, resource);
    }

    /**
     * POST /io-t-emulator/rooms/{roomId}/inject-telemetry → 200 with the resulting state.
     * @param {number} roomId
     * @param {{simulatedSensorType: string, readingValue: string, forceStatusChange: boolean}} resource
     */
    injectTelemetry(roomId, resource) {
        return this.http.post(`${basePath}/rooms/${roomId}/inject-telemetry`, resource);
    }
}
