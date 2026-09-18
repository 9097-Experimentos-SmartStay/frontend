import { createRouter, createWebHistory } from "vue-router";
import { clearSession, getRole, hasSession } from "./shared/infrastructure/session/session-storage.js";
import { hasRequiredRole, isKnownRole } from "./iam/domain/user-role.js";

// --- 1. Import Route Definitions ---
import authRoutes from './shared/presentation/routes/auth-routes.js';
import dashboardRoutes from './shared/presentation/routes/dashboard-routes.js';
import accommodationsRoutes from './accommodations/presentation/routes.js';
import bookingsRoutes from './bookings/presentation/routes.js';
import paymentsRoutes from './payments/presentation/routes.js';

// --- 2. Import Shared Views ---
const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue');
const ProfileDetail = () => import('./profile/presentation/views/ProfileDetail.vue');

// --- 3. Combine All Route Definitions ---
const routes = [
    ...authRoutes,              // IAM  - login, register
    ...dashboardRoutes,         // Dashboards por rol (guest, staff)
    ...accommodationsRoutes,     //  Accommodations (rooms, room-types)
    ...bookingsRoutes,           // Bookings
    ...paymentsRoutes,           // Payments

    {
        path: '/perfil/:id',
        name: 'profile-detail',
        component: ProfileDetail,
        meta: { requiresAuth: true, roles: ['guest', 'staff'] }
    },
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/:pathMatch(.*)*', // Catch-all 404
        name: 'NotFound',
        component: PageNotFound,
        meta: { title: 'Page Not Found', requiresAuth: false }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to) => {
    const isAuthenticated = hasSession();
    const userRole = getRole();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiredRoles = to.meta.roles;
    const publicOnly = to.matched.some(record => record.meta.publicOnly);

    // A token without a role is a broken session: clear it to avoid redirect loops.
    if (isAuthenticated && !userRole) {
        clearSession();
        return to.name === 'login' ? true : { name: 'login' };
    }
    if (requiresAuth && !isAuthenticated) {
        return { name: 'login' };
    }
    if (publicOnly && isAuthenticated) {
        return { name: 'dashboard' };
    }
    if (requiresAuth && !hasRequiredRole(userRole, requiredRoles)) {
        // Known role: back to its own dashboard. Unknown role: login.
        return isKnownRole(userRole) ? { name: 'dashboard' } : { name: 'login' };
    }
    return true;
});

// --- 6. Export Router Instance ---
export default router;