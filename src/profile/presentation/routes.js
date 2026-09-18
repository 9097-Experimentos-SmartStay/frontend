import { AppArea, Capability } from '@/iam/domain/user-role.js';

export default [
    {
        // Own profile, any role: guests see their guest profile, staff their account (and staff profile when readable).
        path: '/perfil',
        name: 'profile-detail',
        component: () => import('./views/ProfileDetail.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/perfil/completar',
        name: 'create-profile',
        component: () => import('./views/CreateProfile.vue'),
        meta: { requiresAuth: true, area: AppArea.GUEST }
    },
    {
        path: '/staff/guests',
        name: 'staff-guests',
        component: () => import('./views/AllProfiles.vue'),
        meta: { requiresAuth: true, area: AppArea.STAFF, capability: Capability.VIEW_GUESTS }
    }
];
