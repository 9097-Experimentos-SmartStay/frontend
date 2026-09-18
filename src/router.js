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

const AppLayout = () => import('./shared/presentation/layouts/app-layout.vue');
const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

/**
 * Route meta used by the guard:
 * - `requiresAuth`: needs a session (everything else is public).
 * - `guestOnly`: public page that a signed-in user skips (login, register, forgot-password).
 * - `area`: 'guest' | 'staff' (AppArea); `capability`: a Capability of user-role.js.
 */
const featureRoutes = [
    ...iamRoutes,
    ...dashboardRoutes,
    ...accommodationsRoutes,
    ...bookingsRoutes,
    ...paymentsRoutes,
    ...profileRoutes,
];

/** A page that needs a session belongs to the signed-in app, so it renders inside the app layout (header + nav). */
const needsSession = (route) => route.meta?.requiresAuth === true;

const routes = [
    // Public pages (sign-in, sign-up, e-mail verification, password recovery, MFA): their own minimal layout.
    ...featureRoutes.filter((route) => !needsSession(route)),
    {
        // Signed-in app: the children keep their absolute paths; this record only adds the layout and the auth meta.
        path: '/',
        component: AppLayout,
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: { name: 'login' } },
            ...featureRoutes.filter(needsSession),
        ],
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
