/**
 * RoomType Domain Entity.
 * Represents the type of a room in the business domain.
 * @class
 */
export class RoomType {
    /**
     * Creates an instance of RoomType.
     * @param {Object} params - The parameters for creating the room type.
     * @param {number} params.id - The unique identifier of the room type.
     * @param {string} params.name - The name of the room type.
     * @param {string} params.description - The description of the room type.
     */
    constructor({ id, name, description }) {
        /**
         * @property {number} id - The unique identifier of the room type.
         */
        this.id = id;
        /**
         * @property {string} name - The name of the room type.
         */
        this.name = name;
        /**
         * @property {string} description - The description of the room type.
         */
        this.description = description;
    }

    /**
     * Creates a RoomType instance from a resource object.
     * @param {Object} resource - The resource object to convert from.
     * @param {number} resource.id - The unique identifier.
     * @param {string} resource.name - The name.
     * @param {string} resource.description - The description.
     * @returns {RoomType} A new RoomType instance.
     */
    static fromResource(resource) {
        return new RoomType({
            id: resource.id,
            name: resource.name,
            description: resource.description
        });
    }
}
