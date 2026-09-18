import { createRouter, createWebHistory } from "vue-router";
import pinia from "./pinia.js";
import useIamStore from "./iam/application/iam.store.js";
import { canAccessRoute, dashboardRouteNameFor } from "./iam/domain/user-role.js";

import iamRoutes from './iam/presentation/routes.js';
import dashboardRoutes from './shared/presentation/routes/dashboard-routes.js';
import accommodationsRoutes from './accommodations/presentation/routes.js';
import bookingsRoutes from './bookings/presentation/routes.js';
import paymentsRoutes from './payments/presentation/routes.js';
import profileRoutes from './profile/presentation/routes.js';

const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

/**
 * Route meta used by the guard:
 * - `requiresAuth`: needs a session (everything else is public).
 * - `guestOnly`: public page that a signed-in user skips (login, register, forgot-password).
 * - `area`: 'guest' | 'staff' (AppArea); `capability`: a Capability of user-role.js.
 */
const routes = [
    ...iamRoutes,
    ...dashboardRoutes,
    ...accommodationsRoutes,
    ...bookingsRoutes,
    ...paymentsRoutes,
    ...profileRoutes,
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/:pathMatch(.*)*', // Catch-all 404
        name: 'NotFound',
        component: PageNotFound,
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to) => {
    const iamStore = useIamStore(pinia);
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !iamStore.isSignedIn) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }
    if (to.meta.guestOnly && iamStore.isSignedIn) {
        return { name: 'dashboard' };
    }
    if (requiresAuth && !canAccessRoute(iamStore.role, to.meta)) {
        // Not allowed for this role: back to its own dashboard (never to a route it cannot open, so no loop).
        const home = dashboardRouteNameFor(iamStore.role);
        if (!home) {
            iamStore.endSession();
            return { name: 'login' };
        }
        return to.name === home ? true : { name: home };
    }
    return true;
});

export default router;
