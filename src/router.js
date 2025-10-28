// src/shared/infrastructure/router/index.js

import { createRouter, createWebHistory } from "vue-router";

// --- 1. Import Module Route Definitions ---
import authRoutes from './modules/auth/presentation/routes.js';
import dashboardRoutes from './modules/dashboard/presentation/routes.js';
import propertyRoutes from './modules/property/presentation/routes.js';
import bookingRoutes from './modules/booking/presentation/routes.js';


// --- 2. Import Shared Views (Shared Presentation Layer) ---
// Using dynamic imports for lazy loading and better performance.
const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue');
// Choose your primary authenticated view (e.g., dashboard, home).
const DashboardView = () => import('./shared/presentation/views/home.vue'); // This dashboard view is shown after login, and it's provisional for now.


// --- 3. Combine All Route Definitions ---
const routes = [
    // Spread routes imported from feature modules first.
    ...authRoutes,
    ...dashboardRoutes,
    ...propertyRoutes,
    ...bookingRoutes,
    // ...propertyRoutes,
    // ...billingRoutes,
    // ...analyticsRoutes,
    // ...profileRoutes,
    // ...notificationsRoutes,

    // Define shared/core routes, typically protected ones.
    {
        path: '/dashboard', // Main route after login.
        name: 'dashboard', // Used for programmatic navigation and guards.
        component: DashboardView,
        meta: { title: 'Dashboard', requiresAuth: true } // Requires user to be logged in.
    },

    // Define root path redirect and catch-all route last.
    {
        path: '/',
        // Default redirect; the navigation guard might override this based on auth status.
        redirect: { name: 'dashboard' }
    },
    {
        path: '/:pathMatch(.*)*', // Matches any path not matched above.
        name: 'NotFound', // Best practice to name the 404 route.
        component: PageNotFound,
        meta: { title: 'Page Not Found', requiresAuth: false } // Publicly accessible.
    }
];

// --- 4. Create Router Instance ---
const router = createRouter({
    // Use HTML5 history mode for clean URLs (requires server configuration for deployment).
    history: createWebHistory(import.meta.env.BASE_URL),
    routes, // Pass the combined routes array.
});

// --- 5. Global Navigation Guard ---
// This function runs before each navigation.
router.beforeEach((to, from, next) => {
    // a. Set the document title dynamically based on route meta.
    const baseTitle = 'SmartStay'; // App's base title.
    document.title = `${to.meta?.title || 'Page'} | ${baseTitle}`;

    // b. Check authentication status.
    // **IMPROVEMENT NEEDED:** Replace basic localStorage check with a more robust method
    // using your state management (Pinia/Vuex) store (e.g., check for valid token/user state).
    const isAuthenticated = !!localStorage.getItem('user_token'); // Basic check: Does a token exist?

    // c. Check if the target route requires authentication.
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // d. Check if the target route is only accessible to unauthenticated users (e.g., login/register).
    const publicOnly = to.matched.some(record => record.meta.publicOnly);

    // --- Debugging Logs (Remove in production) ---
    console.log(`Navigating to: ${String(to.name)}, Requires Auth: ${requiresAuth}, Authenticated: ${isAuthenticated}, Public Only: ${publicOnly}`);

    // --- Access Control Logic ---
    if (requiresAuth && !isAuthenticated) {
        // User tries to access a protected route but is not logged in.
        console.warn("GUARD: Access denied (Not Authenticated). Redirecting to Login.");
        next({ name: 'login' }); // Redirect to the login page.
    } else if (publicOnly && isAuthenticated) {
        // User is logged in but tries to access a public-only route (login/register).
        console.info("GUARD: Access denied (Already Authenticated). Redirecting to Dashboard.");
        next({ name: 'dashboard' }); // Redirect to the main dashboard.
    } else {
        // Allow navigation to proceed.
        console.log("GUARD: Access granted.");
        next();
    }
});

// --- 6. Export Router Instance ---
export default router;