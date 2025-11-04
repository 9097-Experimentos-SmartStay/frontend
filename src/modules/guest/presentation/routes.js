// src/modules/guest/presentation/routes.js

export default [
    { path: "/guest/dashboard", component: () => import("../../dashboard/presentation/views/GuestDashboard.vue") },
    { path: "/guest/bookings", component: () => import("../../booking/presentation/views/GuestMyBookings.vue") },
    { path: "/guest/review", component: () => import("../../booking/presentation/views/GuestReviewForm.vue") },
    {
        path: "/guest/properties",
        name: "guest-properties",
        component: () => import("./views/GuestProperties.vue"), // La que creamos antes
        meta: { requiresAuth: true, roles: ['guest'] }
    },
    {
        // El :id es el "parámetro" (el ID de la propiedad)
        path: "/guest/property/:id",
        name: "guest-property-details", // El nombre que usamos en el router.push()
        component: () => import("./views/GuestProperties.vue"), // El archivo que crearemos
        meta: { requiresAuth: true, roles: ['guest'] }
    },
];
