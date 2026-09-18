/**
 * Role rules of the frontend, in ONE place.
 *
 * Mirrors the backend role matrix (audit/04-backend-contract.md §1, `Policies.RoleMatrix`):
 * - the role strings the API sends (`guest`, `reception`, `housekeeping`, `maintenance`, `admin`, `chain_admin`);
 * - the area each role lands in after sign-in (guest area or staff area);
 * - the capabilities each role has, used by route guards and to hide what a role cannot do.
 *
 * The backend is the one that enforces permissions (403). These rules only keep the UI honest:
 * never show a button whose request would be rejected.
 */

/** Role strings of the API. `staff` no longer exists (migrated to `reception`). */
export const UserRole = Object.freeze({
    GUEST: 'guest',
    RECEPTION: 'reception',
    HOUSEKEEPING: 'housekeeping',
    MAINTENANCE: 'maintenance',
    ADMIN: 'admin',
    CHAIN_ADMIN: 'chain_admin',
});

const ALL_ROLES = Object.freeze(Object.values(UserRole));

/** Areas of the web app. Every route declares one in `meta.area`. */
export const AppArea = Object.freeze({
    GUEST: 'guest',
    STAFF: 'staff',
});

/** What a role can do in the web app. Routes may require one in `meta.capability`. */
export const Capability = Object.freeze({
    VIEW_HOTELS: 'viewHotels',
    MANAGE_HOTELS: 'manageHotels',
    REGISTER_HOTEL: 'registerHotel',
    VIEW_ROOMS: 'viewRooms',
    MANAGE_ROOMS: 'manageRooms',
    CREATE_ROOM_TYPES: 'createRoomTypes',
    MANAGE_MASTER_DATA: 'manageMasterData',
    VIEW_BOOKINGS: 'viewBookings',
    CONFIRM_BOOKINGS: 'confirmBookings',
    CANCEL_BOOKINGS: 'cancelBookings',
    VIEW_PAYMENTS: 'viewPayments',
    VIEW_ANALYTICS: 'viewAnalytics',
    VIEW_GUESTS: 'viewGuests',
    MANAGE_USERS: 'manageUsers',
    VIEW_AUDIT_LOG: 'viewAuditLog',
});

const { GUEST, RECEPTION, HOUSEKEEPING, MAINTENANCE, ADMIN, CHAIN_ADMIN } = UserRole;
const STAFF_ROLES = [RECEPTION, HOUSEKEEPING, MAINTENANCE, ADMIN, CHAIN_ADMIN];

/** Capability → roles that have it (backend role matrix, §1). */
const CAPABILITY_ROLES = Object.freeze({
    [Capability.VIEW_HOTELS]: STAFF_ROLES,
    [Capability.MANAGE_HOTELS]: [ADMIN, CHAIN_ADMIN],
    [Capability.REGISTER_HOTEL]: [ADMIN, CHAIN_ADMIN],
    [Capability.VIEW_ROOMS]: STAFF_ROLES,
    [Capability.MANAGE_ROOMS]: [ADMIN, CHAIN_ADMIN],
    [Capability.CREATE_ROOM_TYPES]: [ADMIN, CHAIN_ADMIN],
    [Capability.MANAGE_MASTER_DATA]: [CHAIN_ADMIN],
    [Capability.VIEW_BOOKINGS]: STAFF_ROLES,
    [Capability.CONFIRM_BOOKINGS]: [RECEPTION, ADMIN, CHAIN_ADMIN],
    [Capability.CANCEL_BOOKINGS]: [RECEPTION, ADMIN, CHAIN_ADMIN],
    [Capability.VIEW_PAYMENTS]: [RECEPTION, ADMIN, CHAIN_ADMIN],
    [Capability.VIEW_ANALYTICS]: [ADMIN, CHAIN_ADMIN],
    [Capability.VIEW_GUESTS]: [RECEPTION, ADMIN, CHAIN_ADMIN],
    [Capability.MANAGE_USERS]: [ADMIN, CHAIN_ADMIN],
    [Capability.VIEW_AUDIT_LOG]: [ADMIN, CHAIN_ADMIN],
});

/** Roles each administrator may assign when creating a user or changing a role (§3, POST /users). */
const ASSIGNABLE_ROLES = Object.freeze({
    [ADMIN]: [RECEPTION, HOUSEKEEPING, MAINTENANCE],
    [CHAIN_ADMIN]: [RECEPTION, HOUSEKEEPING, MAINTENANCE, ADMIN],
});

/** Roles that must belong to a hotel (a chain_admin has to send `hotelId` when creating them). */
const HOTEL_BOUND_ROLES = Object.freeze([RECEPTION, HOUSEKEEPING, MAINTENANCE]);

/**
 * @param {unknown} rawRole
 * @returns {string|null} The role in the API vocabulary, or null when it is not a known role.
 */
export function normalizeRole(rawRole) {
    if (!rawRole) return null;
    const role = String(rawRole).trim().toLowerCase().replace(/[\s-]+/g, '_');
    const alias = role === 'chainadmin' ? CHAIN_ADMIN : role;
    return ALL_ROLES.includes(alias) ? alias : null;
}

/**
 * @param {string|null} role
 * @returns {boolean}
 */
export function isKnownRole(role) {
    return ALL_ROLES.includes(role);
}

/**
 * @param {string|null} role
 * @returns {string|null} The area of the role, or null for an unknown role.
 */
export function areaFor(role) {
    if (role === GUEST) return AppArea.GUEST;
    if (STAFF_ROLES.includes(role)) return AppArea.STAFF;
    return null;
}

/**
 * Dashboard after sign-in (US-02 scenario 1): guests → guest dashboard,
 * every staff role (reception, housekeeping, maintenance, admin, chain_admin) → staff dashboard,
 * whose options depend on the capabilities of the role.
 * @param {string|null} role
 * @returns {string|null} Route name, or null for an unknown role.
 */
export function dashboardRouteNameFor(role) {
    const area = areaFor(role);
    if (area === AppArea.GUEST) return 'guest-dashboard';
    if (area === AppArea.STAFF) return 'staff-dashboard';
    return null;
}

/**
 * @param {string|null} role
 * @param {string} capability - One of {@link Capability}.
 * @returns {boolean}
 */
export function can(role, capability) {
    return (CAPABILITY_ROLES[capability] ?? []).includes(role);
}

/**
 * Route access check used by the router guard.
 * @param {string|null} role
 * @param {{area?: string, capability?: string}} meta - Route meta.
 * @returns {boolean}
 */
export function canAccessRoute(role, meta = {}) {
    if (meta.area && areaFor(role) !== meta.area) return false;
    if (meta.capability && !can(role, meta.capability)) return false;
    return true;
}

/**
 * @param {string|null} actorRole
 * @returns {string[]} Roles the actor may assign to other users (empty for non-administrators).
 */
export function assignableRolesFor(actorRole) {
    return [...(ASSIGNABLE_ROLES[actorRole] ?? [])];
}

/**
 * @param {string} role
 * @returns {boolean} True when a user with this role must belong to a hotel.
 */
export function isHotelBoundRole(role) {
    return HOTEL_BOUND_ROLES.includes(role);
}

/**
 * Admin scope (D2): an admin manages only the hotel in their `hotelId`; a chain_admin manages every hotel.
 * @param {{role: string|null, hotelId: number|null}} user
 * @param {number} hotelId
 * @returns {boolean}
 */
export function canManageHotel(user, hotelId) {
    if (!user) return false;
    if (user.role === CHAIN_ADMIN) return true;
    return user.role === ADMIN && user.hotelId != null && Number(user.hotelId) === Number(hotelId);
}

/**
 * D2: a chain_admin can always register hotels; an admin only while they have no hotel (then 409).
 * @param {{role: string|null, hotelId: number|null}} user
 * @returns {boolean}
 */
export function canRegisterHotel(user) {
    if (!user) return false;
    if (user.role === CHAIN_ADMIN) return true;
    return user.role === ADMIN && user.hotelId == null;
}
