import { AppArea, Capability } from '@/iam/domain/user-role.js';

const guest = { requiresAuth: true, area: AppArea.GUEST };

export default [
    // Guest area: how to pay and the payment status live in the booking detail (old links still work).
    {
        path: '/guest/bookings/:bookingId/payment',
        name: 'guest-payment',
        redirect: (to) => ({ name: 'guest-booking-detail', params: { bookingId: to.params.bookingId } }),
        meta: guest
    },
    {
        path: '/guest/payments/booking/:bookingId',
        name: 'guest-payments-by-booking',
        redirect: (to) => ({ name: 'guest-booking-detail', params: { bookingId: to.params.bookingId } }),
        meta: guest
    },
    // Staff area
    {
        path: '/staff/payments',
        name: 'staff-payments',
        component: () => import('./views/StaffPayments.vue'),
        meta: { requiresAuth: true, area: AppArea.STAFF, capability: Capability.VIEW_PAYMENTS }
    }
];
