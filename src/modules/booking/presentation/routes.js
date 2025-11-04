import GuestMyBookings from './views/GuestMyBookings.vue';
import GuestReviewForm from './views/GuestReviewForm.vue';

export default [
    {
        path: '/guest/booking/my-list',
        name: 'guest-my-bookings',
        component: GuestMyBookings,
        meta: { requiresAuth: true, roles: ['guest', 'admin'] }
    },
    {
        path: '/guest/booking/review', // Ruta simple por ahora
        name: 'guest-review-form',
        component: GuestReviewForm,
        meta: { requiresAuth: true, roles: ['guest', 'admin'] }
        // You can do it more specific like: '/guest/booking/:bookingId/review'
        // props: true, // To pass bookingId as prop to the view
    },
    {
        // "Lee" los IDs del "pase" (la URL)
        path: '/guest/booking/new/:propertyId/:roomId',
        name: 'guest-create-booking',
        component: () => import('./views/GuestCreateBooking.vue'),
        meta: { requiresAuth: true, roles: ['guest'] }
    },
     // You can add more routes here as needed. ej: '/booking/new', '/admin/booking/all'
];