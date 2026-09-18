import { AppArea, Capability } from '@/iam/domain/user-role.js';

/**
 * IAM routes.
 * - `guestOnly`: public pages a signed-in user does not need (they are sent to their dashboard).
 * - `/verify-email`, `/reset-password`: public and reachable in any state, because the backend
 *   e-mails link to them (App__WebBaseUrl) and the link must work even with a session open.
 */
export default [
    {
        path: '/login',
        name: 'login',
        component: () => import('./views/sign-in-form.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('./views/sign-up-form.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/verify-email',
        name: 'verify-email',
        component: () => import('./views/verify-email.vue'),
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: () => import('./views/forgot-password.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/reset-password',
        name: 'reset-password',
        component: () => import('./views/reset-password.vue'),
    },
    {
        path: '/staff/users',
        name: 'staff-users',
        component: () => import('./views/user-management.vue'),
        meta: { requiresAuth: true, area: AppArea.STAFF, capability: Capability.MANAGE_USERS }
    },
    {
        path: '/staff/audit-log',
        name: 'staff-audit-log',
        component: () => import('./views/audit-log.vue'),
        meta: { requiresAuth: true, area: AppArea.STAFF, capability: Capability.VIEW_AUDIT_LOG }
    },
];
