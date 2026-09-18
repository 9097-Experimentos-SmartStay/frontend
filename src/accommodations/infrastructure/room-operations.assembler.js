import { Money } from '@/shared/domain/money.js';
import { RoomMap, RoomMapEntry, RoomStatusChange } from '../domain/model/room-map.js';
import { toRoomStatus } from '../domain/model/room-status.js';

const toDate = (value) => (value ? new Date(value) : null);

/**
 * RoomMapResource / RoomStatusChangeResource (§5, US-06) ↔ domain.
 */
export class RoomOperationsAssembler {
    /**
     * @param {Object} response - Axios response of GET /rooms/map.
     * @returns {RoomMap}
     */
    static toMapFromResponse(response) {
        const body = response?.data ?? {};
        return new RoomMap({
            hotelId: body.hotelId,
            hotelName: body.hotelName ?? '',
            generatedAt: toDate(body.generatedAt),
            rooms: (body.rooms ?? []).map((room) => new RoomMapEntry({
                id: room.id,
                number: room.number ?? '',
                roomTypeName: room.roomTypeName ?? '',
                description: room.description ?? '',
                pricePerNight: Money.from(room.price),
                status: toRoomStatus(room.status),
                statusSince: toDate(room.statusSince),
                maintenanceOverdue: room.maintenanceOverdue,
                allowedNextStatuses: (room.allowedNextStatuses ?? []).map(toRoomStatus).filter(Boolean),
            })),
        });
    }

    /**
     * @param {Object} response - Axios response of GET /rooms/{id}/status-history (newest first).
     * @returns {RoomStatusChange[]}
     */
    static toHistoryFromResponse(response) {
        return (Array.isArray(response?.data) ? response.data : []).map((change) => new RoomStatusChange({
            id: change.id,
            roomId: change.roomId,
            fromStatus: toRoomStatus(change.fromStatus),
            toStatus: toRoomStatus(change.toStatus),
            origin: change.origin,
            changedAt: toDate(change.changedAt),
            changedByEmail: change.changedByEmail ?? null,
        }));
    }
}
