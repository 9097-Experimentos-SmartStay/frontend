import pinia from '@/pinia.js';
import useIamStore from '@/iam/application/iam.store.js';
import { AppArea, dashboardRouteNameFor } from '@/iam/domain/user-role.js';

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
