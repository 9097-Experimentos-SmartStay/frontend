import { RoomStatus } from '../../domain/model/room-status.js';

/**
 * Colors of the room statuses on the map and in tags (US-06 scenario 2):
 * Disponible green, Ocupada red, Limpieza yellow, Mantenimiento dark gray.
 */
const STYLE = Object.freeze({
    [RoomStatus.AVAILABLE]: { severity: 'success', tile: 'status-available', icon: 'pi pi-check-circle' },
    [RoomStatus.OCCUPIED]: { severity: 'danger', tile: 'status-occupied', icon: 'pi pi-user' },
    [RoomStatus.CLEANING]: { severity: 'warn', tile: 'status-cleaning', icon: 'pi pi-sparkles' },
    [RoomStatus.MAINTENANCE]: { severity: 'contrast', tile: 'status-maintenance', icon: 'pi pi-wrench' },
});

/** @param {string} status @returns {string} PrimeVue Tag severity. */
export const roomStatusSeverity = (status) => STYLE[status]?.severity ?? 'secondary';

/** @param {string} status @returns {string} CSS class of a map tile. */
export const roomStatusTileClass = (status) => STYLE[status]?.tile ?? '';

/** @param {string} status @returns {string} PrimeIcons class. */
export const roomStatusIcon = (status) => STYLE[status]?.icon ?? 'pi pi-circle';

/**
 * @param {Function} t
 * @param {string} status
 * @returns {string}
 */
export const roomStatusLabel = (t, status) => (status ? t(`staffRooms.statuses.${status}`) : '—');

/**
 * "2 d 5 h", "3 h 10 min", "25 min" — how long a room has been in its status.
 * @param {Function} t
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(t, minutes) {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    if (days > 0) return t('duration.daysHours', { days, hours });
    if (hours > 0) return t('duration.hoursMinutes', { hours, minutes: mins });
    return t('duration.minutes', { minutes: mins });
}
