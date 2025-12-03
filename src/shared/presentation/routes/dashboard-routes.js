// src/shared/presentation/routes/dashboard-routes.js
// Rutas de dashboard - redirección según rol

export default [
    // --- Ruta Central de Redirección ---
    {
        path: '/dashboard',
        name: 'dashboard',
        beforeEnter: (to, from, next) => {
            const userRole = localStorage.getItem('user_role');
            console.log('[Router Guard /dashboard] Role:', userRole);

            if (!userRole) {
                console.log('[Router Guard /dashboard] No role, redirecting to login.');
                next({ name: 'login' });
                return;
            }

            // Redirige al dashboard específico según el rol
            switch (userRole) {
                case 'staff':
                    console.log('[Router Guard /dashboard] Redirecting to staff-dashboard.');
                    next({ name: 'staff-dashboard' });
                    break;
                case 'guest':
                    console.log('[Router Guard /dashboard] Redirecting to guest-dashboard.');
                    next({ name: 'guest-dashboard' });
                    break;
                default:
                    console.warn('[Router Guard /dashboard] Unknown role:', userRole, 'Redirecting to login.');
                    localStorage.clear();
                    next({ name: 'login' });
            }
        },
        meta: { requiresAuth: true }
    },
    // --- Rutas Específicas del Dashboard ---
    {
        path: '/staff/dashboard',
        name: 'staff-dashboard',
        component: () => import('../views/StaffDashboard.vue'),
        meta: { requiresAuth: true, roles: ['staff'] }
    },
    {
        path: '/guest/dashboard',
        name: 'guest-dashboard',
        component: () => import('../views/GuestDashboard.vue'),
        meta: { requiresAuth: true, roles: ['guest'] }
    },
];

