import pinia from '@/pinia.js';
import useIamStore from '@/iam/application/iam.store.js';
import { AppArea, areaFor, dashboardRouteNameFor } from '@/iam/domain/user-role.js';

/**
 * Entry points linked from the backend e-mails (§17: `/bookings` in booking e-mails, `/rooms` in room staff
 * e-mails). They open the page of the same topic in the area of the signed-in role; the guard sends a user
 * without session to /login first and back here afterwards.
 * @param {{guest: string, staff: string}} targets - Route names per area.
 */
const byArea = (targets) => () => {
    const area = areaFor(useIamStore(pinia).role);
    if (area === AppArea.GUEST) return { name: targets.guest };
    if (area === AppArea.STAFF) return { name: targets.staff };
    return { name: 'login' };
};

/**
 * Dashboards. `/dashboard` sends each role to its own area (rules in iam/domain/user-role.js):
 * guest → guest dashboard; reception, housekeeping, maintenance, admin, chain_admin → staff dashboard.
 */
export default [
    {
        path: '/dashboard',
        name: 'dashboard',
        beforeEnter: () => {
            const target = dashboardRouteNameFor(useIamStore(pinia).role);
            return target ? { name: target } : { name: 'login' };
        },
        meta: { requiresAuth: true }
    },
    {
        path: '/bookings',
        name: 'bookings-link',
        beforeEnter: byArea({ guest: 'guest-bookings', staff: 'staff-bookings' }),
        meta: { requiresAuth: true }
    },
    {
        path: '/rooms',
        name: 'rooms-link',
        beforeEnter: byArea({ guest: 'guest-rooms', staff: 'staff-room-map' }),
        meta: { requiresAuth: true }
    },
    {
        path: '/staff/dashboard',
        name: 'staff-dashboard',
        component: () => import('../views/StaffDashboard.vue'),
        meta: { requiresAuth: true, area: AppArea.STAFF }
    },
    {
        path: '/guest/dashboard',
        name: 'guest-dashboard',
        component: () => import('../views/GuestDashboard.vue'),
        meta: { requiresAuth: true, area: AppArea.GUEST }
    },
];
