import { BaseApi } from '@/shared/infrastructure/services/base-api.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';

const usersPath = endpoints.users;
const auditLogsPath = endpoints.auditLogs;

/**
 * User administration (US-03), contract §3. Only admin and chain_admin may call it.
 */
export class UsersApi extends BaseApi {
    /** GET /users → UserResource[] filtered by the caller's scope (an admin sees their hotel). */
    getAll() {
        return this.http.get(usersPath);
    }

    /**
     * POST /users → 201 UserResource.
     * @param {Object} resource - Built by UserAssembler.toCreateResource.
     */
    create(resource) {
        return this.http.post(usersPath, resource);
    }

    /**
     * POST /users/{id}/assign-role → 200 {message}. Effective on the user's next request.
     * @param {number} userId
     * @param {string} newRole
     */
    assignRole(userId, newRole) {
        return this.http.post(`${usersPath}/${userId}/assign-role`, { targetUserId: userId, newRole });
    }

    /**
     * DELETE /users/{id} → soft deactivation (tokens revoked, history kept).
     * @param {number} userId
     */
    deactivate(userId) {
        return this.http.delete(`${usersPath}/${userId}`);
    }

    /**
     * POST /users/{id}/activate
     * @param {number} userId
     */
    activate(userId) {
        return this.http.post(`${usersPath}/${userId}/activate`);
    }

    /**
     * POST /users/{id}/mfa/reset → 200 {message}. The user sets up the authenticator again at the next sign-in (US-52).
     * @param {number} userId
     */
    resetMfa(userId) {
        return this.http.post(`${usersPath}/${userId}/mfa/reset`);
    }

    /**
     * GET /audit-logs with filters and pagination (§3.1).
     * @param {Record<string, string|number>} params - Built by AuditLogAssembler.toQueryParams.
     */
    getAuditLogs(params) {
        return this.http.get(auditLogsPath, { params });
    }
}
