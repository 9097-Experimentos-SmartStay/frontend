import { RoomType } from '../domain/model/room-type.entity.js';

export class RoomTypeAssembler {
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new RoomType({
            id: resource.id,
            name: resource.name,
            description: resource.description
        });
    }

    static toEntitiesFromResponse(response) {
        if (!response.data || !Array.isArray(response.data)) return [];
        return response.data.map(resource => RoomTypeAssembler.toEntityFromResource(resource));
    }

    static toEntityFromResponse(response) {
        if (!response.data) return null;
        return RoomTypeAssembler.toEntityFromResource(response.data);
    }
}