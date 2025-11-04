// src/modules/property/domain/model/property.entity.js

export class Property {
    constructor({
                    id,
                    hostId,
                    name,
                    location,
                    image_url,
                    description,
                    base_price,
                    type,
                    amenities = [] // Default a un array vacío
                }) {
        this.id = id;
        this.hostId = hostId;
        this.name = name;
        this.location = location;
        this.image_url = image_url;
        this.description = description;
        this.base_price = base_price;
        this.type = type;
        this.amenities = amenities;
    }

    /**
     * "Arma" de lógica de negocio:
     * Revisa si el hotel tiene una habilidad especial.
     * @param {string} amenityName - Ej: "piscina", "wifi"
     * @returns {boolean}
     */
    hasAmenity(amenityName) {
        return this.amenities.includes(amenityName.toLowerCase());
    }

    /**
     * "Arma" de utilidad:
     * Devuelve una descripción corta para las vistas de lista.
     * @returns {string}
     */
    getShortDescription() {
        if (!this.description) return "Sin descripción.";
        return this.description.length > 100
            ? this.description.substring(0, 100) + '...'
            : this.description;
    }
}