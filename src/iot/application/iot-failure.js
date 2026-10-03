/** Business reasons of the room climate use cases (US-11, US-19), carried by an OperationFailure. */
export const IotFailureReason = Object.freeze({
    /**
     * 404 without the `room.not_found` code: the emulator answers every existing room with a state,
     * so it is the route itself missing — this API does not expose the IoT emulator. The UI says the
     * simulation is unavailable instead of showing "not found".
     */
    EMULATOR_NOT_AVAILABLE: 'emulatorNotAvailable',
});

/** Code of the 404 the emulator sends for a room that does not exist. */
const ROOM_NOT_FOUND = 'room.not_found';

/**
 * Business reason of an IoT emulator problem, or null to fall back to the generic reason of the status.
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {string|null}
 */
export function classifyIotProblem(problem) {
    if (problem.status === 404 && !problem.is(ROOM_NOT_FOUND)) return IotFailureReason.EMULATOR_NOT_AVAILABLE;
    return null;
}
