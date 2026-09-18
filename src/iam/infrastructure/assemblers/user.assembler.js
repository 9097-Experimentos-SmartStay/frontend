import { User } from '../../domain/model/user.entity.js';

const toDate = (value) => (value ? new Date(value) : null);
const toNumberOrNull = (value) => (value == null || value === '' ? null : Number(value));

/**
 * UserResource / sign-in body ↔ {@link User}.
 * The e-mail is read from `email`; `username` (deprecated alias, same value) is only a fallback.
 */
export class UserAssembler {
    /**
     * @param {Object} resource - UserResource (§3) or the user part of the sign-in body (§2.3).
     * @returns {User|null}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new User({
            id: Number(resource.id),
            email: resource.email ?? resource.username ?? '',
            firstName: resource.firstName ?? null,
            lastName: resource.lastName ?? null,
            role: resource.role,
            status: resource.status,
            hotelId: toNumberOrNull(resource.hotelId),
            chainId: toNumberOrNull(resource.chainId),
            emailVerified: resource.emailVerified,
            lockedUntil: toDate(resource.lockedUntil),
            createdAt: toDate(resource.createdAt),
            mfaEnabled: resource.mfaEnabled,
            mfaEnrollmentRequired: resource.mfaEnrollmentRequired,
        });
    }

    /**
     * @param {Object} response - Axios response with a UserResource[] body.
     * @returns {User[]}
     */
    static toEntitiesFromResponse(response) {
        return Array.isArray(response?.data) ? response.data.map(UserAssembler.toEntityFromResource) : [];
    }

    /**
     * @param {import('../../domain/commands/create-user.command.js').CreateUserCommand} command
     * @returns {Object} Body of POST /users.
     */
    static toCreateResource(command) {
        const resource = {
            firstName: command.firstName,
            lastName: command.lastName,
            email: command.email,
            password: command.password,
            role: command.role,
        };
        if (command.hotelId != null) resource.hotelId = command.hotelId;
        return resource;
    }

    /**
     * Plain snapshot kept in the browser session storage.
     * @param {User} user
     * @returns {Object}
     */
    static toSnapshot(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            hotelId: user.hotelId,
            chainId: user.chainId,
            emailVerified: user.emailVerified,
        };
    }

    /**
     * @param {Object} snapshot - From {@link UserAssembler.toSnapshot}.
     * @returns {User|null}
     */
    static fromSnapshot(snapshot) {
        return snapshot ? new User(snapshot) : null;
    }
}
