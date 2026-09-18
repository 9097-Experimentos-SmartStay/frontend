import { AppArea, Capability } from '@/iam/domain/user-role.js';

const guest = { requiresAuth: true, area: AppArea.GUEST };

export default [
    // Guest area
    {
        path: '/guest/bookings/:bookingId/payment',
        name: 'guest-payment',
        component: () => import('./views/GuestPayments.vue'),
        meta: guest,
        props: true
    },
    {
        path: '/guest/payments/booking/:bookingId',
        name: 'guest-payments-by-booking',
        component: () => import('./views/GuestPaymentsByBooking.vue'),
        meta: guest,
        props: true
    },
    // Staff area
    {
        path: '/staff/payments',
        name: 'staff-payments',
        component: () => import('./views/StaffPayments.vue'),
        meta: { requiresAuth: true, area: AppArea.STAFF, capability: Capability.VIEW_PAYMENTS }
    }
];
