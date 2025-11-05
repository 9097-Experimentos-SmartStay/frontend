// src/modules/guest/presentation/routes.js

export default [
    {
        path: "/guest/dashboard",
        name: "guest-dashboard", // Asumiendo que esta es la ruta de tu dashboard
        component: () => import("../../dashboard/presentation/views/GuestDashboard.vue")
    },
    {
        path: "/guest/bookings",
        name: "guest-my-bookings", // Asumiendo este nombre
        component: () => import("../../booking/presentation/views/GuestMyBookings.vue")
    },
    {
        path: "/guest/review",
        name: "guest-review-form", // Asumiendo este nombre
        component: () => import("../../booking/presentation/views/GuestReviewForm.vue")
    },
    {
        path: "/guest/properties",
        name: "guest-properties",
        component: () => import("./views/GuestProperties.vue"),
        meta: { requiresAuth: true, roles: ['guest'] }
    },
    {
        // El :id es el "parámetro" (el ID de la propiedad)
        path: "/guest/property/:id",
        name: "guest-property-details", // El nombre que usamos en el router.push()
        component: () => import("./views/useGuestPropertyDetails.vue"),

        meta: { requiresAuth: true, roles: ['guest'] }
    },
];