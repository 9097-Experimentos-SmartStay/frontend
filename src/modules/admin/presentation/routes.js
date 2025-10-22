export default [
    { path: "/admin", component: () => import("./admin_dashboard.vue") },
    { path: "/admin/staff", component: () => import("./manage_staff.vue") },
    { path: "/admin/rooms", component: () => import("./manage_rooms.vue") }
];
