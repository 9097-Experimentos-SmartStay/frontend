import { createRouter, createWebHistory } from "vue-router";

// Importamos las rutas de cada bounded context
import authRoutes from "../../modules/auth/presentation/routes.js";
import adminRoutes from "../../modules/admin/presentation/routes.js";
import staffRoutes from "../../modules/staff/presentation/routes.js";
import guestRoutes from "../../modules/guest/presentation/routes.js";

const routes = [
    ...authRoutes,
    ...adminRoutes,
    ...staffRoutes,
    ...guestRoutes,
    {
        path: "/",
        redirect: "/register",
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/register",
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});


