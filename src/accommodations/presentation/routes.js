// src/bounded-contexts/accommodations/presentation/routes.js

export default [
    // Rutas para huéspedes
    {
        path: '/guest/accommodations/rooms',
        name: 'guest-rooms',
        component: () => import('./views/GuestRooms.vue'),
        meta: { requiresAuth: true, roles: ['guest'] }
    },
    {
        path: '/guest/accommodations/rooms/:roomId',
        name: 'guest-room-detail',
        component: () => import('./views/GuestRoomDetail.vue'),
        meta: { requiresAuth: true, roles: ['guest'] },
        props: true
    },
    // Rutas para staff
    {
        path: '/staff/accommodations/rooms',
        name: 'staff-rooms',
        component: () => import('./views/StaffRooms.vue'),
        meta: { requiresAuth: true, roles: ['staff'] }
    }
];

