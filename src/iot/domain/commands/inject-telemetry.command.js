/** Sensors the emulator can simulate a reading for (`InjectTelemetryRequest.SimulatedSensorType`). */
export const SimulatedSensor = Object.freeze({
    TEMPERATURE: 'TEMPERATURE_SENSOR',
    MOTION: 'PIR_MOTION_DETECTOR',
});

/** Reading the motion sensor sends when the room has been empty long enough to save power. */
export const NO_MOTION_READING = 'NO_MOTION_DETECTED_30MIN';

/** Reading that means someone is in the room. */
export const MOTION_READING = 'MOTION_DETECTED';

/** Why a telemetry injection is invalid. */
export const TelemetryRuleError = Object.freeze({
    SENSOR_REQUIRED: 'sensorRequired',
    READING_REQUIRED: 'readingRequired',
    TEMPERATURE_NOT_A_NUMBER: 'temperatureNotANumber',
});

/**
 * POST /io-t-emulator/rooms/{roomId}/inject-telemetry: pushes a simulated sensor reading into the
 * board of a room, the way the physical sensor would.
 *
 * This is the emulator's input, not a guest action: the operations board uses it to reproduce a
 * situation (an empty room, a room that got too warm) without the Cisco hardware. The backend parses
 * a temperature reading with `double.TryParse` and silently ignores it when it is not a number, so
 * the numeric check happens here.
 */
export class InjectTelemetryCommand {
    /**
     * @param {Object} params
     * @param {number} params.roomId
     * @param {string} params.sensor - One of {@link SimulatedSensor}.
     * @param {string} params.reading - Sensor-specific value (a number for the temperature sensor).
     * @param {boolean} [params.forceStatusChange] - Marks the board as altered by the emulator.
     */
    constructor({ roomId, sensor, reading, forceStatusChange = false }) {
        this.roomId = roomId;
        this.sensor = sensor ?? null;
        this.reading = reading == null ? '' : String(reading).trim();
        this.forceStatusChange = !!forceStatusChange;
        Object.freeze(this);
    }

    /**
     * @returns {{code: string}|null} The rule broken, or null when the request can go out.
     */
    validate() {
        if (!Object.values(SimulatedSensor).includes(this.sensor)) {
            return { code: TelemetryRuleError.SENSOR_REQUIRED };
        }
        if (!this.reading) {
            return { code: TelemetryRuleError.READING_REQUIRED };
        }
        if (this.sensor === SimulatedSensor.TEMPERATURE && !Number.isFinite(Number(this.reading))) {
            return { code: TelemetryRuleError.TEMPERATURE_NOT_A_NUMBER };
        }
        return null;
    }
}
