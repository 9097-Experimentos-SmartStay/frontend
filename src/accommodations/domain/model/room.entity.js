// src/bounded-contexts/accommodations/domain/model/room.entity.js

export class Room {
    constructor({ id, roomTypeId, roomTypeName, description, amenities }) {
        this.id = id;
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.description = description;
        this.amenities = amenities || [];
    }

    static fromResource(resource) {
        return new Room({
            id: resource.id,
            roomTypeId: resource.roomTypeId,
            roomTypeName: resource.roomTypeName,
            description: resource.description,
            amenities: resource.amenities || []
        });
    }

    hasAmenity(amenity) {
        return this.amenities.includes(amenity);
    }
}

