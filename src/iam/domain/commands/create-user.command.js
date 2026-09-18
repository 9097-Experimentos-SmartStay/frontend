import { Email } from '../model/email.js';

/**
 * US-03 scenario 1: an administrator creates a staff account.
 * An admin always creates users of their own hotel (`hotelId` may be omitted);
 * a chain_admin must send `hotelId` for hotel-bound roles.
 */
export class CreateUserCommand {
    /**
     * @param {Object} params
     * @param {string} params.firstName
     * @param {string} params.lastName
     * @param {string} params.email
     * @param {string} params.password - Initial password (8–128).
     * @param {string} params.role
     * @param {number|null} [params.hotelId]
     */
    constructor({ firstName, lastName, email, password, role, hotelId = null }) {
        this.firstName = firstName.trim();
        this.lastName = lastName.trim();
        this.email = new Email(email).value;
        this.password = password;
        this.role = role;
        this.hotelId = hotelId;
        Object.freeze(this);
    }
}
