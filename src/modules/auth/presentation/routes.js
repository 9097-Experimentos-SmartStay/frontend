// src/modules/auth/presentation/routes.js
import LoginView from "./views/loginview.vue";
import RegisterView from "./views/registerview.vue";

export default [
    {
        path: "/login",
        name: "login", // Añadido para referencia en el guard
        component: LoginView,
        meta: { title: 'Login', requiresAuth: false, publicOnly: true }
    },
    {
        path: "/register",
        name: "register", // Añadido para referencia en el guard
        component: RegisterView,
        meta: { title: 'Register', requiresAuth: false, publicOnly: true }
    },
];