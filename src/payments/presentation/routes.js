// src/bounded-contexts/payments/presentation/routes.js

export default [
    // Rutas para huéspedes
    {
        path: '/guest/payments',
        name: 'guest-payments',
        component: () => import('./views/GuestPayments.vue'),
        meta: { requiresAuth: true, roles: ['guest'] }
    },
    {
        path: '/guest/payments/booking/:bookingId',
        name: 'guest-payments-by-booking',
        component: () => import('./views/GuestPaymentsByBooking.vue'),
        meta: { requiresAuth: true, roles: ['guest'] },
        props: true
    },
    // Rutas para staff
    {
        path: '/staff/payments',
        name: 'staff-payments',
        component: () => import('./views/StaffPayments.vue'),
        meta: { requiresAuth: true, roles: ['staff'] }
    }
];

