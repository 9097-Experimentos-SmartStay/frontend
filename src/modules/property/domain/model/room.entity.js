// src/modules/property/domain/model/room.entity.js

export class Room {
    constructor({
                    id,
                    name,
                    number,
                    status,
                    propertyId,
                    floor,
                    type,
                    lastCleanedAt,
                    updatedAt,
                    createdAt,
                    image_url,
                    price,
                    promotion
                }) {
        this.id = id;
        this.name = name;
        this.number = number;
        this.status = status || 'disponible';
        this.propertyId = propertyId;
        this.floor = floor;
        this.type = type;
        this.lastCleanedAt = lastCleanedAt ? new Date(lastCleanedAt) : null;
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.image_url = image_url;
        this.price = price;
        this.promotion = promotion;
    }

    isAvailable() {
        return this.status === 'disponible';
    }

    isCleaning() {
        return this.status === 'por limpiar';
    }

    markAsCleaning() {
        this.status = 'por limpiar';
        this.updatedAt = new Date();
    }

    markAsAvailable() {
        this.status = 'disponible';
        this.updatedAt = new Date();
    }
}
