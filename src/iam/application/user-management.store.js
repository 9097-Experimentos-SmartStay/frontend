import { defineStore } from 'pinia';
import { ref } from 'vue';
import { UsersApi } from '../infrastructure/api/users-api.js';
import { UserAssembler } from '../infrastructure/assemblers/user.assembler.js';
import { AuditLogAssembler } from '../infrastructure/assemblers/audit-log.assembler.js';
import { AuditLogPage } from '../domain/model/audit-log-entry.entity.js';
import { AuditLogQuery } from '../domain/commands/audit-log.query.js';
import { UserStatus } from '../domain/model/user.entity.js';
import { AuthFailure, AuthFailureReason } from './auth-failure.js';
import { ProblemDetails } from '@/shared/infrastructure/http/problem-details.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const usersApi = new UsersApi();

/**
 * User administration and access audit (US-03), for admin and chain_admin.
 * The backend scopes every call: an admin only sees and manages the users of their hotel.
 * Actions throw {@link AuthFailure}.
 */
export const useUserManagementStore = defineStore('user-management', () => {
    /** @type {import('vue').Ref<import('../domain/model/user.entity.js').User[]>} */
    const users = ref([]);
    const loadingUsers = ref(false);

    /** @type {import('vue').Ref<AuditLogPage>} */
    const auditLog = ref(AuditLogPage.empty());
    /** @type {import('vue').Ref<AuditLogQuery>} */
    const auditQuery = ref(new AuditLogQuery());
    const loadingAuditLog = ref(false);

    function replaceUser(userId, changes) {
        users.value = users.value.map((user) => (user.id === userId ? user.with(changes) : user));
    }

    /** @returns {Promise<void>} */
    async function fetchUsers() {
        loadingUsers.value = true;
        try {
            users.value = UserAssembler.toEntitiesFromResponse(await usersApi.getAll());
        } catch (error) {
            reportError('Error fetching users', error);
            throw AuthFailure.from(error);
        } finally {
            loadingUsers.value = false;
        }
    }

    /**
     * US-03 scenario 1.
     * @param {import('../domain/commands/create-user.command.js').CreateUserCommand} command
     * @returns {Promise<import('../domain/model/user.entity.js').User>}
     * @throws {AuthFailure} emailAlreadyRegistered | conflict (admin without hotel) | forbidden | invalidData
     */
    async function createUser(command) {
        try {
            const response = await usersApi.create(UserAssembler.toCreateResource(command));
            const created = UserAssembler.toEntityFromResource(response.data);
            users.value = [...users.value, created];
            return created;
        } catch (error) {
            const failure = AuthFailure.from(error);
            if (failure.problem.status === 409 && failure.problem.detailIncludes('email')) {
                failure.reason = AuthFailureReason.EMAIL_ALREADY_REGISTERED;
            }
            throw failure;
        }
    }

    /**
     * US-03 scenario 2: effective on the user's next request (no re-login).
     * @param {number} userId
     * @param {string} newRole
     * @returns {Promise<void>}
     */
    async function changeRole(userId, newRole) {
        try {
            await usersApi.assignRole(userId, newRole);
            replaceUser(userId, { role: newRole });
        } catch (error) {
            throw AuthFailure.from(error);
        }
    }

    /**
     * US-03 scenario 3: soft deactivation. The user loses access at once; history is kept.
     * @param {number} userId
     * @returns {Promise<void>}
     */
    async function deactivateUser(userId) {
        try {
            await usersApi.deactivate(userId);
            replaceUser(userId, { status: UserStatus.INACTIVE });
        } catch (error) {
            throw AuthFailure.from(error);
        }
    }

    /**
     * @param {number} userId
     * @returns {Promise<void>}
     */
    async function activateUser(userId) {
        try {
            await usersApi.activate(userId);
            replaceUser(userId, { status: UserStatus.ACTIVE });
        } catch (error) {
            throw AuthFailure.from(error);
        }
    }

    /**
     * US-03 scenario 4: loads a page of the audit log with the given filters.
     * @param {AuditLogQuery} [query] - Defaults to the last query.
     * @returns {Promise<void>}
     */
    async function fetchAuditLog(query = auditQuery.value) {
        auditQuery.value = query;
        if (query.hasInvalidRange) {
            throw new AuthFailure(AuthFailureReason.INVALID_DATA, new ProblemDetails({ status: 400 }));
        }
        loadingAuditLog.value = true;
        try {
            const response = await usersApi.getAuditLogs(AuditLogAssembler.toQueryParams(query));
            auditLog.value = AuditLogAssembler.toPageFromResponse(response);
        } catch (error) {
            reportError('Error fetching the audit log', error);
            throw AuthFailure.from(error);
        } finally {
            loadingAuditLog.value = false;
        }
    }

    return {
        users,
        loadingUsers,
        auditLog,
        auditQuery,
        loadingAuditLog,
        fetchUsers,
        createUser,
        changeRole,
        deactivateUser,
        activateUser,
        fetchAuditLog,
    };
});
