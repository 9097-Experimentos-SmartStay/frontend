export default [
    { path: "/guest/dashboard", component: () => import("../../dashboard/presentation/views/GuestDashboard.vue") },
    { path: "/guest/properties", component: () => import("../../property/presentation/views/GuestPropertyList.vue") },
    { path: "/guest/bookings", component: () => import("../../booking/presentation/views/GuestMyBookings.vue") },
    { path: "/guest/review", component: () => import("../../booking/presentation/views/GuestReviewForm.vue") }
];
