// src/modules/profile/presentation/routes.js
import AdminProfile from './views/AdminProfile.vue';

export default [
    {
        path: '/admin/profile',
        name: 'admin-profile',
        component: AdminProfile,
        meta: { requiresAuth: true, roles: ['admin'] }
    }
    // Futuro: Aquí pondrías 'staff-profile', 'guest-profile'
];