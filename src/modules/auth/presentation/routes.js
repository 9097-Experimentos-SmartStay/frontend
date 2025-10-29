// src/modules/auth/presentation/routes.js
import LoginView from "./views/loginview.vue";
import RegisterView from "./views/registerview.vue";
import AdminManageUsers from './views/AdminManageUsers.vue';
import AdminEditUser from './views/AdminEditUser.vue';

export default [
    {
        path: "/login",
        name: "login",
        component: LoginView,
        meta: { title: 'Login', requiresAuth: false, publicOnly: true }
    },
    {
        path: "/register",
        name: "register",
        component: RegisterView,
        meta: { title: 'Register', requiresAuth: false, publicOnly: true }
    },
    {
        path: '/admin/auth/users',
        name: 'admin-manage-users',
        component: AdminManageUsers,
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        path: '/admin/auth/users/edit/:userId', // Ruta con parámetro dinámico
        name: 'admin-edit-user',               // Nombre único para la ruta
        component: AdminEditUser,
        props: true, // Opcional: Pasa los params de la ruta como props al componente
        meta: { requiresAuth: true, roles: ['admin'] } // Protegida para admin
    }
];