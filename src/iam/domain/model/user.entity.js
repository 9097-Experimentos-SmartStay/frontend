import { normalizeRole, requiresSecondFactor } from '../user-role.js';

/** Account status strings of the API. */
export const UserStatus = Object.freeze({
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
});

/**
 * An IAM account (UserResource / sign-in response, §2.3 and §3).
 * The e-mail is the login identifier; `username` is a deprecated alias the frontend ignores.
 */
export class User {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {string} params.email
     * @param {string|null} [params.firstName] - Null for accounts created before EP-01.
     * @param {string|null} [params.lastName]
     * @param {string|null} params.role - Normalized role (see user-role.js).
     * @param {string} [params.status] - 'Active' or 'Inactive' (only in UserResource).
     * @param {number|null} [params.hotelId]
     * @param {number|null} [params.chainId]
     * @param {boolean} [params.emailVerified]
     * @param {Date|null} [params.lockedUntil] - End of the last temporary lock.
     * @param {Date|null} [params.createdAt]
     * @param {boolean} [params.mfaEnabled] - Authenticator app set up (US-52; only in UserResource).
     * @param {boolean} [params.mfaEnrollmentRequired] - Staff account that must set it up at the next sign-in.
     */
    constructor({ id, email, firstName = null, lastName = null, role, status = UserStatus.ACTIVE, hotelId = null, chainId = null, emailVerified = false, lockedUntil = null, createdAt = null, mfaEnabled = false, mfaEnrollmentRequired = false }) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = normalizeRole(role);
        this.status = status;
        this.hotelId = hotelId;
        this.chainId = chainId;
        this.emailVerified = !!emailVerified;
        this.lockedUntil = lockedUntil;
        this.createdAt = createdAt;
        this.mfaEnabled = !!mfaEnabled;
        this.mfaEnrollmentRequired = !!mfaEnrollmentRequired;
    }

    /** @returns {boolean} Staff accounts use a second factor (US-52); guests do not. */
    get usesSecondFactor() {
        return requiresSecondFactor(this.role);
    }

    /** @returns {string} "First Last", or the part of the e-mail before "@" for legacy accounts. */
    get displayName() {
        const fullName = [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
        return fullName || (this.email ?? '').split('@')[0];
    }

    /** @returns {string} Up to two uppercase initials for avatars. */
    get initials() {
        if (this.firstName && this.lastName) {
            return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
        }
        return this.displayName.substring(0, 2).toUpperCase();
    }

    /** @returns {boolean} */
    get isActive() {
        return this.status === UserStatus.ACTIVE;
    }

    /**
     * A temporary lock is in effect while `lockedUntil` is in the future.
     * @param {Date} [now]
     * @returns {boolean}
     */
    isLocked(now = new Date()) {
        return !!this.lockedUntil && this.lockedUntil.getTime() > now.getTime();
    }

    /**
     * @param {Partial<User>} changes
     * @returns {User} A copy with the given fields replaced (entities in stores stay immutable).
     */
    with(changes) {
        return new User({ ...this, ...changes });
    }
}
