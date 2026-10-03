import { RoomClimate } from '../domain/model/room-climate.js';

/**
 * Reads a property that the API may send in either casing. ASP.NET serializes `EmulatedRoomState`
 * with camelCase by default, but the emulator returns the model as is, so a different
 * `JsonSerializerOptions` on the server would flip the names: accept both instead of breaking.
 * @param {Object} resource
 * @param {string} camel
 * @returns {unknown}
 */
function read(resource, camel) {
    const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
    return resource[camel] ?? resource[pascal];
}

/**
 * EmulatedRoomState (IoT emulator) ↔ domain.
 */
export class RoomClimateAssembler {
    /**
     * @param {Object|null} resource
     * @param {number} [fallbackRoomId] - Used when the payload omits the room id.
     * @returns {RoomClimate|null}
     */
    static toEntityFromResource(resource, fallbackRoomId) {
        if (!resource) return null;
        const timestamp = read(resource, 'timestamp');
        const parsed = timestamp ? new Date(timestamp) : null;
        return new RoomClimate({
            roomId: Number(read(resource, 'roomId') ?? fallbackRoomId),
            device: read(resource, 'emulatedDevice'),
            temperature: read(resource, 'currentTemperature'),
            motionDetected: read(resource, 'motionDetected'),
            lastCommand: read(resource, 'lastCommandReceived'),
            hardwareStatus: read(resource, 'hardwareStatus'),
            measuredAt: parsed && !Number.isNaN(parsed.getTime()) ? parsed : null,
        });
    }

    /**
     * @param {Object} response - Axios response.
     * @param {number} [fallbackRoomId]
     * @returns {RoomClimate|null}
     */
    static toEntityFromResponse(response, fallbackRoomId) {
        return RoomClimateAssembler.toEntityFromResource(response?.data, fallbackRoomId);
    }

    /**
     * @param {import('../domain/commands/set-thermostat.command.js').SetThermostatCommand} command - Already validated.
     * @returns {{targetTemperatureCelsius: number, fanSpeed: string}}
     */
    static toThermostatResource(command) {
        return {
            targetTemperatureCelsius: command.targetTemperature,
            fanSpeed: command.fanSpeed,
        };
    }

    /**
     * @param {import('../domain/commands/inject-telemetry.command.js').InjectTelemetryCommand} command - Already validated.
     * @returns {{simulatedSensorType: string, readingValue: string, forceStatusChange: boolean}}
     */
    static toTelemetryResource(command) {
        return {
            simulatedSensorType: command.sensor,
            readingValue: command.reading,
            forceStatusChange: command.forceStatusChange,
        };
    }
}
