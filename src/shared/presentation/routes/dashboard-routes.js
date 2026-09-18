// src/shared/presentation/routes/dashboard-routes.js
// Rutas de dashboard - redirección según rol
import { getRole } from '../../infrastructure/session/session-storage.js';
import { dashboardRouteNameFor } from '../../../iam/domain/user-role.js';

export default [
    // --- Ruta Central de Redirección ---
    {
        path: '/dashboard',
        name: 'dashboard',
        // Sends each role to its own dashboard (rules in iam/domain/user-role.js).
        beforeEnter: () => {
            const target = dashboardRouteNameFor(getRole());
            return target ? { name: target } : { name: 'login' };
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

