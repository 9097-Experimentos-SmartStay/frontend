export default [
    { path: "/staff", component: () => import("../../dashboard/presentation/views/staff_dashboard.vue") },
    { path: "/staff/tasks", component: () => import("../../property/presentation/views/StaffTaskList.vue") },
    { path: "/staff/rooms", component: () => import("../../property/presentation/views/StaffRoomCleaningList.vue") }
];
