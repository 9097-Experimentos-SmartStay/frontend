import { Email } from '../model/email.js';

/**
 * US-01: self sign-up. The public form never sends a role: the backend creates a `guest`
 * (staff accounts are created by an administrator, US-03).
 */
export class SignUpCommand {
    /**
     * @param {Object} params
     * @param {string} params.firstName
     * @param {string} params.lastName
     * @param {string} params.email
     * @param {string} params.password
     */
    constructor({ firstName, lastName, email, password }) {
        this.firstName = firstName.trim();
        this.lastName = lastName.trim();
        this.email = new Email(email).value;
        this.password = password;
        Object.freeze(this);
    }
}
