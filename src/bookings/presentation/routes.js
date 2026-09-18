import { AppArea, Capability } from '@/iam/domain/user-role.js';

const guest = { requiresAuth: true, area: AppArea.GUEST };

export default [
    // Guest area
    {
        path: '/guest/bookings',
        name: 'guest-bookings',
        component: () => import('./views/GuestBookings.vue'),
        meta: guest
    },
    {
        // US-51: search by hotel and dates, then book (?hotelId=&roomId=&checkIn=&checkOut= preselect it).
        path: '/guest/bookings/new',
        name: 'guest-create-booking',
        component: () => import('./views/GuestSearchRooms.vue'),
        meta: guest
    },
    {
        path: '/guest/bookings/:bookingId',
        name: 'guest-booking-detail',
        component: () => import('./views/GuestBookingDetail.vue'),
        meta: guest,
        props: true
    },
    // Staff area
    {
        path: '/staff/bookings',
        name: 'staff-bookings',
        component: () => import('./views/StaffBookings.vue'),
        meta: { requiresAuth: true, area: AppArea.STAFF, capability: Capability.VIEW_BOOKINGS }
    }
];
