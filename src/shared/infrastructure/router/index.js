// src/shared/infrastructure/router/index.js
// NOTA: Este archivo parece ser un router alternativo no usado
// El router principal está en src/router.js
// Este archivo se mantiene por compatibilidad pero no se usa

import { createRouter, createWebHistory } from "vue-router";

// Importamos las rutas de cada bounded context
import authRoutes from "../../presentation/routes/auth-routes.js";
import dashboardRoutes from "../../presentation/routes/dashboard-routes.js";
import accommodationsRoutes from "../../../accommodations/presentation/routes.js";
import bookingsRoutes from "../../../bookings/presentation/routes.js";
import paymentsRoutes from "../../../payments/presentation/routes.js";

const routes = [
    ...authRoutes,
    ...dashboardRoutes,
    ...accommodationsRoutes,
    ...bookingsRoutes,
    ...paymentsRoutes,
    {
        path: "/",
        redirect: "/login",
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/login",
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});


