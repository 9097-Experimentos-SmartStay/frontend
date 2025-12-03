

import { createRouter, createWebHistory } from "vue-router";

// --- 1. Import Route Definitions ---
import authRoutes from './shared/presentation/routes/auth-routes.js';
import dashboardRoutes from './shared/presentation/routes/dashboard-routes.js';
import accommodationsRoutes from './accommodations/presentation/routes.js';
import bookingsRoutes from './bookings/presentation/routes.js';
import paymentsRoutes from './payments/presentation/routes.js';

// --- 2. Import Shared Views ---
const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

// --- 3. Combine All Route Definitions ---
const routes = [
    ...authRoutes,              // IAM  - login, register
    ...dashboardRoutes,         // Dashboards por rol (guest, staff)
    ...accommodationsRoutes,     //  Accommodations (rooms, room-types)
    ...bookingsRoutes,           // Bookings
    ...paymentsRoutes,           // Payments

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

router.beforeEach((to, from, next) => {
    console.log("--- AUTH_GUARD (INICIO) ---");
    console.log("localStorage 'user_token' ES:", localStorage.getItem('user_token'));

    // Compatibilidad: buscar token en ambos lugares
    const isAuthenticated = !!(localStorage.getItem('user_token') || localStorage.getItem('token'));
    const userRole = localStorage.getItem('user_role');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiredRoles = to.meta.roles; // Roles específicos requeridos por la ruta
    const publicOnly = to.matched.some(record => record.meta.publicOnly);

    console.log(`[Global Guard] Navigating to: ${String(to.name) || to.path}, Auth: ${isAuthenticated}, Role: ${userRole}, RequiresAuth: ${requiresAuth}, RequiredRoles: ${requiredRoles}, PublicOnly: ${publicOnly}`);

    if (isAuthenticated && !userRole) {
        console.log('[Global Guard] Token found but No Role. Clearing session to avoid loop.');
        localStorage.clear();
        next({ name: 'login' });
        return;
    }
    if (requiresAuth && !isAuthenticated) {
        console.log('[Global Guard] Auth required, redirecting to login.');
        next({ name: 'login' });
    } else if (publicOnly && isAuthenticated) {
        console.log('[Global Guard] PublicOnly route accessed while logged in, redirecting to dashboard.');
        next({ name: 'dashboard' });
    } else if (requiresAuth && requiredRoles && !requiredRoles.includes(userRole)) {
        // 3. Necesita rol específico, no lo tiene -> va a su propio dashboard (o a 'No Autorizado')
        console.log(`[Global Guard] Role mismatch. Required: ${requiredRoles}, User has: ${userRole}. Redirecting to dashboard.`);
        // Solo redirige si el usuario tiene un rol válido (guest o staff)
        if (userRole === 'guest' || userRole === 'staff') {
            next({ name: 'dashboard' }); // Redirige a su dashboard correcto
        } else {
            next({ name: 'login' }); // Si no tiene rol válido, va a login
        }
    } else {
        // 4. Permitido (ruta pública, o logueado con rol correcto)
        console.log('[Global Guard] Allowing navigation.');
        next();
    }
});

// --- 6. Export Router Instance ---
export default router;