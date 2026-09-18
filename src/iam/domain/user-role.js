/**
 * Role rules of the frontend, in one place.
 *
 * TODO(phase-2b): the backend roles (Admin, ChainAdmin, Staff, Guest, ...) are not final.
 * When they are, adapt ONLY this file. The current behavior is kept on purpose:
 * roles are lowercased, routes allow 'staff' or 'guest', and anything containing
 * 'admin' is sent to the staff dashboard.
 */
export const UserRole = Object.freeze({
    STAFF: 'staff',
    GUEST: 'guest',
});

/**
 * @param {unknown} rawRole
 * @returns {string} The role lowercased and trimmed ('' when missing).
 */
export function normalizeRole(rawRole) {
    return rawRole ? String(rawRole).toLowerCase().trim() : '';
}

/**
 * Picks the role of a signed-in user: first of `roles[]`, else `role`, else guest.
 * @param {{role?: string, roles?: string[]}} user
 * @returns {string}
 */
export function resolveUserRole(user) {
    let role = UserRole.GUEST;
    if (Array.isArray(user?.roles) && user.roles.length > 0 && user.roles[0]) {
        role = user.roles[0];
    } else if (user?.role) {
        role = user.role;
    }
    return normalizeRole(role);
}

/**
 * @param {string} role
 * @returns {string|null} The dashboard route name for the role, or null when unknown.
 */
export function dashboardRouteNameFor(role) {
    const normalized = normalizeRole(role);
    if (!normalized) return null;
    if (normalized === UserRole.STAFF || normalized.includes('admin')) return 'staff-dashboard';
    if (normalized === UserRole.GUEST || normalized === 'user') return 'guest-dashboard';
    return null;
}

/**
 * @param {string} role
 * @param {string[]|undefined} requiredRoles - `meta.roles` of a route.
 * @returns {boolean}
 */
export function hasRequiredRole(role, requiredRoles) {
    return !requiredRoles || requiredRoles.includes(role);
}

/**
 * @param {string} role
 * @returns {boolean} True for the roles the routes know about.
 */
export function isKnownRole(role) {
    return role === UserRole.STAFF || role === UserRole.GUEST;
}
