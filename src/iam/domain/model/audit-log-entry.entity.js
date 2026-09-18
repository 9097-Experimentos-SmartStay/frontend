/** Values of `action` in GET /audit-logs (§3.1). */
export const AuditAction = Object.freeze({
    SIGN_IN_SUCCEEDED: 'SignInSucceeded',
    SIGN_IN_FAILED: 'SignInFailed',
    ACCOUNT_LOCKED: 'AccountLocked',
    SIGNED_OUT: 'SignedOut',
    PASSWORD_RESET: 'PasswordReset',
    PASSWORD_CHANGED: 'PasswordChanged',
    USER_CREATED: 'UserCreated',
    ROLE_CHANGED: 'RoleChanged',
    USER_DEACTIVATED: 'UserDeactivated',
    USER_ACTIVATED: 'UserActivated',
    MFA_ENABLED: 'MfaEnabled',
    MFA_VERIFIED: 'MfaVerified',
    MFA_FAILED: 'MfaFailed',
    MFA_RECOVERY_CODE_USED: 'MfaRecoveryCodeUsed',
    MFA_RESET: 'MfaReset',
    SIGNED_OUT_EVERYWHERE: 'SignedOutEverywhere',
    ASSIGNMENT_CHANGED: 'AssignmentChanged',
});

export const AuditOutcome = Object.freeze({
    SUCCESS: 'Success',
    FAILURE: 'Failure',
});

/**
 * One entry of the access audit (US-03 scenario 4): who did what, to whom and when.
 */
export class AuditLogEntry {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {Date} params.occurredAt
     * @param {string} params.action - One of {@link AuditAction}.
     * @param {string} params.outcome - One of {@link AuditOutcome}.
     * @param {number|null} params.actorUserId
     * @param {string|null} params.actorEmail
     * @param {number|null} params.targetUserId
     * @param {string|null} params.targetEmail
     * @param {number|null} params.hotelId
     * @param {string|null} params.ipAddress
     * @param {import('./audit-details.js').AuditDetails|null} params.details
     */
    constructor({ id, occurredAt, action, outcome, actorUserId, actorEmail, targetUserId, targetEmail, hotelId, ipAddress, details }) {
        this.id = id;
        this.occurredAt = occurredAt;
        this.action = action;
        this.outcome = outcome;
        this.actorUserId = actorUserId;
        this.actorEmail = actorEmail;
        this.targetUserId = targetUserId;
        this.targetEmail = targetEmail;
        this.hotelId = hotelId;
        this.ipAddress = ipAddress;
        this.details = details;
    }

    /** @returns {boolean} */
    get failed() {
        return this.outcome === AuditOutcome.FAILURE;
    }
}

/**
 * A page of audit entries plus the paging data of the API.
 */
export class AuditLogPage {
    /**
     * @param {Object} params
     * @param {AuditLogEntry[]} params.items
     * @param {number} params.page - 1-based.
     * @param {number} params.pageSize
     * @param {number} params.totalCount
     * @param {number} params.totalPages
     */
    constructor({ items, page, pageSize, totalCount, totalPages }) {
        this.items = items;
        this.page = page;
        this.pageSize = pageSize;
        this.totalCount = totalCount;
        this.totalPages = totalPages;
    }

    static empty(pageSize = 20) {
        return new AuditLogPage({ items: [], page: 1, pageSize, totalCount: 0, totalPages: 0 });
    }
}
