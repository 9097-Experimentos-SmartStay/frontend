import { Money } from '@/shared/domain/money.js';
import { ROOM_STATUS_ORDER, RoomStatus } from './room-status.js';

const MINUTE_MS = 60 * 1000;

/**
 * A room on the hotel's room map (US-06 scenario 2): its status, since when, and the statuses it can move to.
 * The transitions come from the API (`allowedNextStatuses`), so the rule lives in one place: the backend.
 */
export class RoomMapEntry {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {string} params.number
     * @param {string} params.roomTypeName
     * @param {string} params.description
     * @param {Money} params.pricePerNight
     * @param {string} params.status - One of {@link RoomStatus}.
     * @param {Date|null} params.statusSince
     * @param {boolean} params.maintenanceOverdue - In maintenance longer than the alert threshold (24 h).
     * @param {string[]} params.allowedNextStatuses
     */
    constructor({ id, number, roomTypeName, description, pricePerNight, status, statusSince, maintenanceOverdue, allowedNextStatuses }) {
        this.id = id;
        this.number = number;
        this.roomTypeName = roomTypeName;
        this.description = description;
        this.pricePerNight = pricePerNight ?? Money.zero();
        this.status = status;
        this.statusSince = statusSince;
        this.maintenanceOverdue = !!maintenanceOverdue;
        this.allowedNextStatuses = Object.freeze([...(allowedNextStatuses ?? [])]);
        Object.freeze(this);
    }

    /** @returns {string} */
    get label() {
        return this.number || `#${this.id}`;
    }

    /**
     * @param {string} status
     * @returns {boolean} True when the API allows moving from the current status to `status`.
     */
    canChangeTo(status) {
        return this.allowedNextStatuses.includes(status);
    }

    /** @returns {boolean} */
    get isUnderMaintenance() {
        return this.status === RoomStatus.MAINTENANCE;
    }

    /**
     * @param {Date} [now]
     * @returns {number} Whole minutes in the current status (0 when unknown).
     */
    minutesInStatus(now = new Date()) {
        if (!this.statusSince) return 0;
        return Math.max(0, Math.floor((now.getTime() - this.statusSince.getTime()) / MINUTE_MS));
    }
}

/**
 * Every room of a hotel with its status and a count per status (GET /rooms/map).
 */
export class RoomMap {
    /**
     * @param {Object} params
     * @param {number} params.hotelId
     * @param {string} params.hotelName
     * @param {Date|null} params.generatedAt
     * @param {RoomMapEntry[]} params.rooms
     */
    constructor({ hotelId, hotelName, generatedAt, rooms }) {
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.generatedAt = generatedAt;
        this.rooms = Object.freeze([...rooms].sort(byRoomNumber));
        Object.freeze(this);
    }

    /** @returns {Record<string, number>} Rooms per status, in the display order of the statuses. */
    get summary() {
        return Object.fromEntries(ROOM_STATUS_ORDER.map((status) => [status, this.rooms.filter((room) => room.status === status).length]));
    }

    /** @returns {number} Rooms in maintenance for longer than the alert threshold (US-06 scenario 4). */
    get overdueCount() {
        return this.rooms.filter((room) => room.maintenanceOverdue).length;
    }

    /**
     * @param {number} roomId
     * @returns {RoomMapEntry|null}
     */
    find(roomId) {
        return this.rooms.find((room) => room.id === roomId) ?? null;
    }
}

/** "2" < "10" < "10A" < "B1": numbers read naturally, like a hotel floor plan. */
function byRoomNumber(a, b) {
    return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * One change in the status history of a room (US-06 scenario 3): who, when, from → to.
 */
export class RoomStatusChange {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {number} params.roomId
     * @param {string} params.fromStatus
     * @param {string} params.toStatus
     * @param {string} params.origin - `Staff` (manual change) or `CheckIn`.
     * @param {Date|null} params.changedAt
     * @param {string|null} params.changedByEmail
     */
    constructor({ id, roomId, fromStatus, toStatus, origin, changedAt, changedByEmail }) {
        this.id = id;
        this.roomId = roomId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.origin = origin;
        this.changedAt = changedAt;
        this.changedByEmail = changedByEmail;
        Object.freeze(this);
    }
}
