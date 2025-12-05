/**
 * @class SignInResource
 * @summary Resource representing sign-in data.
 */
export class SignInResource {
    /**
     * @param {string|number} id - The user ID.
     * @param {string} username - The username.
     * @param {string} token - The authentication token.
     * @param {string} [role] - The user role (optional).
     * @param {string} [email] - The user email (optional).
     */
    constructor({id, username, token, role, email}) {
        this.id = id;
        this.username = username;
        this.token = token;
        this.role = role;
        this.email = email;
    }
}