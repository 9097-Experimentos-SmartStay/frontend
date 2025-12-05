/**
 * Hotel Domain Entity.
 * Represents the business object for a Hotel property.
 * @class
 */
export class Hotel {
    /**
     * Creates an instance of Hotel.
     * @param {Object} params - The parameters for creating the hotel.
     * @param {number} params.id - The unique identifier of the hotel.
     * @param {string} params.name - The name of the hotel.
     * @param {string} params.description - The description of the hotel.
     * @param {string} params.location - The location of the hotel.
     * @param {number} params.rating - The rating of the hotel.
     * @param {string} params.photoUrl - The URL of the hotel's photo.
     * @param {number} params.basePrice - The base price of the hotel.
     * @param {Array<string>} [params.amenities=[]] - The list of amenities provided by the hotel.
     */
    constructor({ id, name, description, location, rating, photoUrl, basePrice, amenities }) {
        /**
         * @property {number} id - The unique identifier of the hotel.
         */
        this.id = id;
        /**
         * @property {string} name - The name of the hotel.
         */
        this.name = name;
        /**
         * @property {string} description - The description of the hotel.
         */
        this.description = description;
        /**
         * @property {string} location - The location of the hotel.
         */
        this.location = location;
        /**
         * @property {number} rating - The rating of the hotel.
         */
        this.rating = rating;
        /**
         * @property {string} photoUrl - The URL of the hotel's photo.
         */
        this.photoUrl = photoUrl;
        /**
         * @property {number} basePrice - The base price of the hotel.
         */
        this.basePrice = basePrice;
        /**
         * @property {Array<string>} amenities - The list of amenities provided by the hotel.
         */
        this.amenities = amenities || [];
    }
}