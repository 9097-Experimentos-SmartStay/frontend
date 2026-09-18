/**
 * @class SignUpCommand
 * @summary Represents a sign-up command in the IAM bounded context. Used to register a new user.
 */
export class SignUpCommand {
    /**
     * Creates an instance of SignUpCommand.
     * @param {Object} params - The sign-up parameters.
     * @param {string} params.username - The username of the user.
     * @param {string} params.password - The password of the user.
     * @param {string} [params.role] - The role of the user (optional).
     * @param {string} [params.name] - The name of the user (optional).
     */
    constructor({username, password, role, name}) {
        /**
         * @property {string} username - The username of the user.
         */
        this.username = username;
        /**
         * @property {string} password - The password of the user.
         */
        this.password = password;
        /**
         * @property {string} [role] - The role of the user (optional).
         */
        this.role = role;
        /**
         * @property {string} [name] - The name of the user (optional).
         */
        this.name = name;
    }
}