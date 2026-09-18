// src/shared/presentation/routes/dashboard-routes.js
// Rutas de dashboard - redirección según rol

export default [
    // --- Ruta Central de Redirección ---
    {
        path: '/dashboard',
        name: 'dashboard',
        beforeEnter: (to, from, next) => {
            let userRole = localStorage.getItem('user_role');

            // Normalización defensiva
            if (userRole) userRole = userRole.toLowerCase().trim();

            console.log(`[Router Guard /dashboard] Detected Role: '${userRole}'`);

            if (!userRole) {
                console.warn('[Router Guard /dashboard] No role found. Redirecting to login.');
                next({ name: 'login' });
                return;
            }

            // Redirige al dashboard específico según el rol
            if (userRole === 'staff' || userRole.includes('admin')) {
                console.log('[Router Guard] -> Staff Dashboard');
                next({ name: 'staff-dashboard' });
            }
            else if (userRole === 'guest' || userRole === 'user') {
                console.log('[Router Guard] -> Guest Dashboard');
                next({ name: 'guest-dashboard' });
            }
            else {
                console.error(`[Router Guard] Unknown role '${userRole}'. Redirecting to login for safety.`);
                // Opcional: No borrar todo el localStorage, solo redirigir
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
    {
        path: '/staff/hotels',
        name: 'staff-hotels',
        component: () => import('../../../accommodations/presentation/views/StaffHotels.vue'), // Crearemos este archivo
        meta: { requiresAuth: true, roles: ['staff'] }
    },
    {
        path: '/staff/rooms',
        name: 'staff-rooms',
        component: () => import('../../../accommodations/presentation/views/StaffRooms.vue'), // Crearemos este archivo
        meta: { requiresAuth: true, roles: ['staff'] }
    },
    {
        path: '/staff/bookings',
        name: 'staff-bookings',
        component: () => import('../../../bookings/presentation/views/StaffBookings.vue'), // Crearemos este archivo
        meta: { requiresAuth: true, roles: ['staff'] }
    },
    {
        path: '/staff/hotels/new',
        name: 'create-hotel',
        component: () => import('../../../accommodations/presentation/views/StaffCreateHotel.vue'),
        meta: { requiresAuth: true, roles: ['staff'] }
    },
    {
        path: '/staff/rooms/new',
        name: 'create-room',
        component: () => import('../../../accommodations/presentation/views/StaffCreateRoom.vue'),
        meta: { requiresAuth: true, roles: ['staff'] }
    },
];

