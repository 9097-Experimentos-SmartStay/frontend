// src/bounded-contexts/bookings/presentation/routes.js

export default [
    // Rutas para huéspedes
    {
        path: '/guest/bookings',
        name: 'guest-bookings',
        component: () => import('./views/GuestBookings.vue'),
        meta: { requiresAuth: true, roles: ['guest'] }
    },
    {
        path: '/guest/bookings/new/:roomId?',
        name: 'guest-create-booking',
        component: () => import('./views/GuestCreateBooking.vue'),
        meta: { requiresAuth: true, roles: ['guest'] },
        props: true
    },
    {
        path: '/guest/bookings/:bookingId',
        name: 'guest-booking-detail',
        component: () => import('./views/GuestBookingDetail.vue'),
        meta: { requiresAuth: true, roles: ['guest'] },
        props: true
    },
    // Rutas para staff
    {
        path: '/staff/bookings',
        name: 'staff-bookings',
        component: () => import('./views/StaffBookings.vue'),
        meta: { requiresAuth: true, roles: ['staff'] }
    }
];

