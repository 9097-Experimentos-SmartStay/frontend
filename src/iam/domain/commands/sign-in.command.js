import { Email } from '../model/email.js';

/**
 * US-02: sign in with e-mail and password. `rememberMe` asks the backend for a refresh token.
 */
export class SignInCommand {
    /**
     * @param {Object} params
     * @param {string} params.email
     * @param {string} params.password
     * @param {boolean} [params.rememberMe=false]
     */
    constructor({ email, password, rememberMe = false }) {
        this.email = new Email(email).value;
        this.password = password;
        this.rememberMe = !!rememberMe;
        Object.freeze(this);
    }
}
