// src/modules/staff/presentation/routes.js
export default [
    { path: "/staff", component: () => import("../../dashboard/presentation/views/StaffDashboard.vue") },
    { path: "/staff/tasks", component: () => import("../../property/presentation/views/StaffTaskList.vue") },
    { path: "/staff/rooms", component: () => import("../../property/presentation/views/StaffRoomCleaningList.vue") },
    {
        path: '/staff/profile',
        name: 'staff-profile',
        component: () => import('./views/StaffProfileView.vue'),
    },
];
