import {User} from "../domain/user.entity.js";

/**
 * @class UserAssembler
 * @summary Assembler for converting user resources to entities.
 */
export class UserAssembler {
    /**
     * @static
     * @param {Object} resource - The user resource.
     * @returns {User} The User entity.
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;

        const rawRole = resource.role || resource.Role;

        // Manejo de roles como array (si existiera)
        const rawRoles = resource.roles || resource.Roles || [rawRole];

        return {
            id: resource.id || resource.Id,
            username: resource.username || resource.Username,
            role: rawRole,
            roles: rawRoles
        };
    }
    
    /**
     * @static
     * @param {Object} response - The API response object.
     * @param {number} response.status - The HTTP status code.
     * @param {string} response.statusText - The status text.
     * @param {Array|Object} response.data - The response data.
     * @returns {User[]} Array of User entities.
     */
    static toEntitiesFromResponse(response) {
        if (!response.data || !Array.isArray(response.data)) return [];
        return response.data.map(resource => UserAssembler.toEntityFromResource(resource));
    }
}