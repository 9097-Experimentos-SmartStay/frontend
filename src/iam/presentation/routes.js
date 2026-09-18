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
    // Second step of a staff sign-in (US-52). Public: the mfaToken lives in the IAM store (memory only),
    // and each view sends the user back to /login when there is no pending challenge.
    {
        path: '/login/two-factor/setup',
        name: 'mfa-enrollment',
        component: () => import('./views/mfa-enrollment.vue'),
    },
    {
        path: '/login/two-factor',
        name: 'mfa-verification',
        component: () => import('./views/mfa-verification.vue'),
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
