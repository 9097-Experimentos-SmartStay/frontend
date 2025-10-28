// src/router.js (Asumiendo que este es tu archivo principal de router)

import { createRouter, createWebHistory } from "vue-router";

// --- 1. Import Module Route Definitions ---
// Ajusta las rutas si son diferentes a tu estructura actual
import authRoutes from './modules/auth/presentation/routes.js'; // Contiene /login, /register, /admin/auth/users
import dashboardRoutes from './modules/dashboard/presentation/routes.js'; // Contiene /dashboard (redirector) y /admin/dashboard, etc.
import propertyRoutes from './modules/property/presentation/routes.js'; // Contiene /admin/property/rooms, /guest/property/list, etc.
import bookingRoutes from './modules/booking/presentation/routes.js'; // Contiene /guest/booking/my-list, /guest/booking/review
// import billingRoutes from './modules/billing/router.js'; // Descomenta cuando existan


// --- 2. Import Shared Views ---
// Ajusta la ruta si es necesario
const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue');
// const HomeView = () => import('./shared/presentation/views/home.vue'); // Ya no necesitamos DashboardView aquí


// --- 3. Combine All Route Definitions ---
const routes = [
    // Spread routes imported from feature modules first.
    ...authRoutes,
    ...dashboardRoutes, // <--- Rutas de dashboard (incluye el redirector /dashboard)
    ...propertyRoutes,
    ...bookingRoutes,
    // ...billingRoutes,
    // ... otros módulos ...

    // --- ELIMINA ESTA DEFINICIÓN REDUNDANTE ---
    // {
    //     path: '/dashboard', // Ya está definido en dashboardRoutes
    //     name: 'dashboard',
    //     component: DashboardView, // Ya no se usa directamente
    //     meta: { title: 'Dashboard', requiresAuth: true }
    // },
    // --- FIN ELIMINACIÓN ---

    // Define root path redirect y catch-all route last.
    {
        path: '/',
        // Redirige a login o a dashboard según si está autenticado (la guardia global lo maneja)
        redirect: '/login' // Puede redirigir a login, la guardia se encargará si ya está logueado
    },
    {
        path: '/:pathMatch(.*)*', // Catch-all 404
        name: 'NotFound',
        component: PageNotFound,
        meta: { title: 'Page Not Found', requiresAuth: false }
    }
];

// --- 4. Create Router Instance ---
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// --- 5. Global Navigation Guard ---
// (Mantenemos la guardia global robusta que incluye chequeo de roles)
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('user_token');
    const userRole = localStorage.getItem('user_role');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiredRoles = to.meta.roles; // Roles específicos requeridos por la ruta
    const publicOnly = to.matched.some(record => record.meta.publicOnly);

    console.log(`[Global Guard] Navigating to: ${String(to.name) || to.path}, Auth: ${isAuthenticated}, Role: ${userRole}, RequiresAuth: ${requiresAuth}, RequiredRoles: ${requiredRoles}, PublicOnly: ${publicOnly}`);

    if (requiresAuth && !isAuthenticated) {
        // 1. Necesita login, no está logueado -> va a login
        console.log('[Global Guard] Auth required, redirecting to login.');
        next({ name: 'login' });
    } else if (publicOnly && isAuthenticated) {
        // 2. Ruta solo pública (login/reg), pero está logueado -> va a dashboard (que redirige)
        console.log('[Global Guard] PublicOnly route accessed while logged in, redirecting to dashboard.');
        next({ name: 'dashboard' });
    } else if (requiresAuth && requiredRoles && !requiredRoles.includes(userRole)) {
        // 3. Necesita rol específico, no lo tiene -> va a su propio dashboard (o a 'No Autorizado')
        console.log(`[Global Guard] Role mismatch. Required: ${requiredRoles}, User has: ${userRole}. Redirecting to dashboard.`);
        next({ name: 'dashboard' }); // Redirige a su dashboard correcto
    } else {
        // 4. Permitido (ruta pública, o logueado con rol correcto)
        console.log('[Global Guard] Allowing navigation.');
        next();
    }
});
// --- Fin Guardia Global ---

// --- 6. Export Router Instance ---
export default router;