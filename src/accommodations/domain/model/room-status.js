/** Operational status of a room (US-29, US-06). New rooms start Available. */
export const RoomStatus = Object.freeze({
    AVAILABLE: 'Available',
    OCCUPIED: 'Occupied',
    CLEANING: 'Cleaning',
    MAINTENANCE: 'Maintenance',
});

/** Display order of the statuses (legends, summaries). */
export const ROOM_STATUS_ORDER = Object.freeze([
    RoomStatus.AVAILABLE,
    RoomStatus.OCCUPIED,
    RoomStatus.CLEANING,
    RoomStatus.MAINTENANCE,
]);

/**
 * @param {unknown} value
 * @returns {string|null} The status in the API vocabulary (case-insensitive), or null.
 */
export function toRoomStatus(value) {
    const text = String(value ?? '').toLowerCase();
    return ROOM_STATUS_ORDER.find((status) => status.toLowerCase() === text) ?? null;
}
