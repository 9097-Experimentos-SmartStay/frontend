/**
 * Comfort band of a guest room, in Celsius. Outside it the UI nudges the guest (too cold / too warm)
 * and flags the room on the operations board.
 */
export const COMFORT_RANGE = Object.freeze({ min: 18, max: 25 });

/** How the current temperature reads against {@link COMFORT_RANGE}. */
export const Comfort = Object.freeze({
    COLD: 'cold',
    COMFORTABLE: 'comfortable',
    WARM: 'warm',
});

/** `lastCommand` the emulator writes when it stops conditioning a room nobody is using. */
const POWER_SAVING_COMMAND = 'AUTO_POWER_SAVING_MODE_TRIGGERED';

/** `hardwareStatus` of a board that is answering normally. */
const HEALTHY_HARDWARE = 'OPERATIONAL_EMULATED';

/**
 * Live state of the climate hardware of one room (EmulatedRoomState of the IoT emulator, US-11).
 *
 * The emulator keeps this in memory per room and always answers with a state, defaulting to 22 °C with
 * motion detected, so a room that was never touched still reads as a working board. Nothing here is
 * persisted by the backend: it is the simulated board, not a measurement history.
 */
export class RoomClimate {
    /**
     * @param {Object} params
     * @param {number} params.roomId
     * @param {string} params.device - Emulated board (`EmulatedDevice`).
     * @param {number} params.temperature - Degrees Celsius.
     * @param {boolean} params.motionDetected - Whether the PIR sensor sees someone in the room.
     * @param {string} params.lastCommand - Last command the board processed.
     * @param {string} params.hardwareStatus
     * @param {Date|null} params.measuredAt
     */
    constructor({ roomId, device, temperature, motionDetected, lastCommand, hardwareStatus, measuredAt }) {
        this.roomId = roomId;
        this.device = device || '';
        // `Number(null)` is 0, so an absent reading has to be ruled out before coercing: otherwise a
        // payload without `currentTemperature` would read as a very cold 0 °C room.
        const reading = temperature === null || temperature === undefined || temperature === '' ? NaN : Number(temperature);
        this.temperature = Number.isFinite(reading) ? reading : null;
        this.motionDetected = !!motionDetected;
        this.lastCommand = lastCommand || '';
        this.hardwareStatus = hardwareStatus || '';
        this.measuredAt = measuredAt;
        Object.freeze(this);
    }

    /** @returns {string} One of {@link Comfort}; COMFORTABLE when the temperature is unknown. */
    get comfort() {
        if (this.temperature == null) return Comfort.COMFORTABLE;
        if (this.temperature < COMFORT_RANGE.min) return Comfort.COLD;
        if (this.temperature > COMFORT_RANGE.max) return Comfort.WARM;
        return Comfort.COMFORTABLE;
    }

    /** @returns {boolean} The emulator put the room in power saving because nobody is in it. */
    get isPowerSaving() {
        return this.lastCommand === POWER_SAVING_COMMAND;
    }

    /** @returns {boolean} The board is not reporting its normal status (someone forced it, or it failed). */
    get isHardwareAltered() {
        return !!this.hardwareStatus && this.hardwareStatus !== HEALTHY_HARDWARE;
    }

    /**
     * Energy waste signal (US-19): the room is being conditioned away from the comfort band while
     * nobody is inside and power saving has not kicked in yet.
     * @returns {boolean}
     */
    get isWastingEnergy() {
        return !this.motionDetected && !this.isPowerSaving && this.comfort !== Comfort.COMFORTABLE;
    }

    /**
     * What the operations board should look at first: altered hardware, then wasted energy,
     * then a temperature out of the comfort band.
     * @returns {boolean}
     */
    get needsAttention() {
        return this.isHardwareAltered || this.isWastingEnergy || this.comfort !== Comfort.COMFORTABLE;
    }
}
