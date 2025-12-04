import { Room } from '../domain/model/room.entity.js';

export class RoomAssembler {
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new Room({
            id: resource.id,
            roomTypeId: resource.roomTypeId,
            roomTypeName: resource.roomTypeName || 'Standard',
            description: resource.description,
            amenities: resource.amenities || []
        });
    }

    static toEntitiesFromResponse(response) {
        if (!response.data || !Array.isArray(response.data)) return [];
        return response.data.map(resource => RoomAssembler.toEntityFromResource(resource));
    }

    static toEntityFromResponse(response) {
        if (!response.data) return null;
        return RoomAssembler.toEntityFromResource(response.data);
    }
}