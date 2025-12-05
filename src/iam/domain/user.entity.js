/**
 * @class User
 * @summary Represents a user entity.
 */
export class User {
    /**
     * Creates an instance of User.
     * @param {Object} params - The user parameters.
     * @param {string|number} params.id - The user ID.
     * @param {string} params.username - The username.
     */
    constructor({id, username}) {
        /**
         * @property {string|number} id - The user ID.
         */
        this.id = id;
        /**
         * @property {string} username - The username.
         */
        this.username = username;
    }
}