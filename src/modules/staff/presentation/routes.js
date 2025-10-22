export default [
    { path: "/staff", component: () => import("./staff_dashboard.vue") },
    { path: "/staff/tasks", component: () => import("./task_list.vue") },
    { path: "/staff/rooms", component: () => import("./room_cleaning.vue") }
];
