// src/bounded-contexts/accommodations/domain/model/room-type.entity.js

export class RoomType {
    constructor({ id, name, description }) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    static fromResource(resource) {
        return new RoomType({
            id: resource.id,
            name: resource.name,
            description: resource.description
        });
    }
}

