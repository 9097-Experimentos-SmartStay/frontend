import { AppArea, Capability } from '@/iam/domain/user-role.js';

/**
 * @typedef {Object} NavigationItem
 * @property {string} route - Route name.
 * @property {string} icon - PrimeIcons class.
 * @property {string} labelKey - i18n key of the label.
 * @property {string} [hintKey] - i18n key of a one-line description (staff shortcuts).
 * @property {string} [capability] - Capability the role needs to see the item (user-role.js).
 */

/** @type {ReadonlyArray<NavigationItem>} */
const GUEST_SECTIONS = Object.freeze([
    { route: 'guest-hotels', icon: 'pi pi-map', labelKey: 'nav.guest.hotels' },
    { route: 'guest-rooms', icon: 'pi pi-home', labelKey: 'nav.guest.rooms' },
    { route: 'guest-bookings', icon: 'pi pi-calendar', labelKey: 'nav.guest.bookings' },
]);

const staffSection = (route, icon, key, capability) =>
    ({ route, icon, capability, labelKey: `staffPanel.nav.${key}`, hintKey: `staffPanel.navHint.${key}` });

/** @type {ReadonlyArray<NavigationItem>} */
const STAFF_SECTIONS = Object.freeze([
    staffSection('staff-hotels', 'pi pi-building', 'hotels', Capability.VIEW_HOTELS),
    staffSection('staff-room-map', 'pi pi-th-large', 'roomMap', Capability.VIEW_ROOM_MAP),
    staffSection('staff-rooms', 'pi pi-key', 'rooms', Capability.VIEW_ROOMS),
    staffSection('staff-bookings', 'pi pi-calendar', 'bookings', Capability.VIEW_BOOKINGS),
    staffSection('staff-payments', 'pi pi-wallet', 'payments', Capability.VIEW_PAYMENTS),
    staffSection('staff-guests', 'pi pi-id-card', 'guests', Capability.VIEW_GUESTS),
    staffSection('staff-users', 'pi pi-users', 'users', Capability.MANAGE_USERS),
    staffSection('staff-audit-log', 'pi pi-history', 'audit', Capability.VIEW_AUDIT_LOG),
]);

/**
 * Sections of an area the signed-in role may open: the single list behind the app header and the staff shortcuts,
 * so a section never shows up in one place and not in the other.
 * @param {string|null} area - One of AppArea.
 * @param {(capability: string) => boolean} can - Capability check of the signed-in role.
 * @returns {NavigationItem[]}
 */
export function sectionsFor(area, can) {
    if (area === AppArea.GUEST) return [...GUEST_SECTIONS];
    if (area === AppArea.STAFF) return STAFF_SECTIONS.filter((item) => can(item.capability));
    return [];
}
