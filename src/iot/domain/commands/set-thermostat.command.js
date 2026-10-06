/** Fan speeds the emulator understands (`SetThermostatRequest.FanSpeed`). */
export const FanSpeed = Object.freeze({
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
});

export const FAN_SPEED_ORDER = Object.freeze([FanSpeed.LOW, FanSpeed.MEDIUM, FanSpeed.HIGH]);

/** What a guest may ask the thermostat for, in Celsius, in half-degree steps. */
export const THERMOSTAT_RANGE = Object.freeze({ min: 16, max: 30, step: 0.5 });

/** Why a thermostat request is invalid (checked before sending: the emulator accepts anything). */
export const ThermostatRuleError = Object.freeze({
    TEMPERATURE_REQUIRED: 'temperatureRequired',
    TEMPERATURE_OUT_OF_RANGE: 'temperatureOutOfRange',
    TEMPERATURE_STEP: 'temperatureStep',
    FAN_SPEED_REQUIRED: 'fanSpeedRequired',
});

/**
 * POST /io-t-emulator/rooms/{roomId}/thermostat (US-11): the guest sets the target temperature and
 * the fan speed of their room.
 *
 * The emulator does not validate the payload, so the rules live here: an out-of-range temperature
 * would be accepted and shown back as the room's state.
 */
export class SetThermostatCommand {
    /**
     * @param {Object} params
     * @param {number|string|null} params.targetTemperature - Degrees Celsius.
     * @param {string|null} params.fanSpeed - One of {@link FanSpeed}.
     */
    constructor({ targetTemperature, fanSpeed }) {
        this.targetTemperature = targetTemperature === '' || targetTemperature == null ? null : Number(targetTemperature);
        this.fanSpeed = fanSpeed ?? null;
        Object.freeze(this);
    }

    /**
     * @returns {{code: string, params?: Object}|null} The rule broken, or null when the request can go out.
     */
    validate() {
        const { targetTemperature, fanSpeed } = this;
        if (targetTemperature == null || !Number.isFinite(targetTemperature)) {
            return { code: ThermostatRuleError.TEMPERATURE_REQUIRED };
        }
        if (targetTemperature < THERMOSTAT_RANGE.min || targetTemperature > THERMOSTAT_RANGE.max) {
            return { code: ThermostatRuleError.TEMPERATURE_OUT_OF_RANGE, params: { min: THERMOSTAT_RANGE.min, max: THERMOSTAT_RANGE.max } };
        }
        // Half-degree steps: 21.5 is fine, 21.3 is not (compared in tenths to dodge float noise).
        if (Math.round(targetTemperature * 10) % 5 !== 0) {
            return { code: ThermostatRuleError.TEMPERATURE_STEP, params: { step: THERMOSTAT_RANGE.step } };
        }
        if (!FAN_SPEED_ORDER.includes(fanSpeed)) {
            return { code: ThermostatRuleError.FAN_SPEED_REQUIRED };
        }
        return null;
    }
}
