export default [
    { path: "/guest", component: () => import("./views/guest_dashboard.vue") },
    { path: "/guest/properties", component: () => import("./views/property_list.vue") },
    { path: "/guest/bookings", component: () => import("./views/my_bookings.vue") },
    { path: "/guest/review", component: () => import("./views/review_form.vue") }
];
