/**
 * Hotel Domain Entity.
 * Represents the business object for a Hotel property.
 */
export class Hotel {
    constructor({ id, name, description, location, rating, photoUrl, basePrice, amenities }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.rating = rating;
        this.photoUrl = photoUrl;
        this.basePrice = basePrice;
        this.amenities = amenities || [];
    }
}