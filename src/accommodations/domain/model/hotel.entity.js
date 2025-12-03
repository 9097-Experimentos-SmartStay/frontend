/**
 * Hotel Domain Entity.
 * Represents the business object for a Hotel property.
 */
export class Hotel {
    constructor({ id, name, description, address, city, country, rating, photoUrl }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.city = city;
        this.country = country;
        this.rating = rating;
        this.photoUrl = photoUrl;
    }
}