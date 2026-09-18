/**
 * Facts recorded with an audit entry (§3.1 `details`): the roles of a creation or role change, why a sign-in or a
 * second factor failed, which factor was used, until when an account is locked and how many recovery codes remain.
 * Every field is optional; the view turns them into text in the user's language.
 */
export class AuditDetails {
    /**
     * @param {Object} params
     * @param {string|null} [params.role] - Role given to a new user.
     * @param {string|null} [params.previousRole] - Role before a role change.
     * @param {string|null} [params.newRole] - Role after a role change.
     * @param {string|null} [params.reason] - WrongPassword, UnknownEmail, AccountLocked, AccountDeactivated,
     *   EmailNotVerified, InvalidCode, CodeAlreadyUsed or InvalidRecoveryCode.
     * @param {string|null} [params.method] - Second factor used: AuthenticatorCode or RecoveryCode.
     * @param {Date|null} [params.lockedUntil]
     * @param {number|null} [params.remainingRecoveryCodes]
     * @param {number|null} [params.previousHotelId] - Hotel before an assignment change.
     * @param {number|null} [params.newHotelId] - Hotel after an assignment change.
     * @param {number|null} [params.previousChainId] - Chain before an assignment change.
     * @param {number|null} [params.newChainId] - Chain after an assignment change.
     */
    constructor({ role = null, previousRole = null, newRole = null, reason = null, method = null, lockedUntil = null, remainingRecoveryCodes = null, previousHotelId = null, newHotelId = null, previousChainId = null, newChainId = null } = {}) {
        this.role = role;
        this.previousRole = previousRole;
        this.newRole = newRole;
        this.reason = reason;
        this.method = method;
        this.lockedUntil = lockedUntil;
        this.remainingRecoveryCodes = remainingRecoveryCodes;
        this.previousHotelId = previousHotelId;
        this.newHotelId = newHotelId;
        this.previousChainId = previousChainId;
        this.newChainId = newChainId;
    }

    /** @returns {boolean} The hotel of the account changed. */
    get isHotelChange() {
        return this.previousHotelId !== this.newHotelId && (this.previousHotelId != null || this.newHotelId != null);
    }

    /** @returns {boolean} The chain of the account changed. */
    get isChainChange() {
        return this.previousChainId !== this.newChainId && (this.previousChainId != null || this.newChainId != null);
    }

    /** @returns {boolean} */
    get isRoleChange() {
        return !!(this.previousRole && this.newRole);
    }
}
