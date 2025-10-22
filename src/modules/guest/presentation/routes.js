export default [
    { path: "/guest", component: () => import("./guest_dashboard.vue") },
    { path: "/guest/properties", component: () => import("./property_list.vue") },
    { path: "/guest/bookings", component: () => import("./my_bookings.vue") },
    { path: "/guest/review", component: () => import("./review_form.vue") }
];
