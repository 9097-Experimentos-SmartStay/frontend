export default [
    { path: "/admin", component: () => import("../../dashboard/presentation/views/admin_dashboard.vue") },
    { path: "/admin/staff", component: () => import("../../auth/presentation/views/AdminManageUsers.vue") },
    { path: "/admin/rooms", component: () => import("../../property/presentation/views/AdminManageRooms.vue") }
];
