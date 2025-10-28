export default [
    { path: "/guest", component: () => import("../../dashboard/presentation/views/guest_dashboard.vue") },
    { path: "/guest/properties", component: () => import("../../property/presentation/views/GuestPropertyList.vue") },
    { path: "/guest/bookings", component: () => import("../../booking/presentation/views/GuestMyBookings.vue") },
    { path: "/guest/review", component: () => import("../../booking/presentation/views/GuestReviewForm.vue") }
];
