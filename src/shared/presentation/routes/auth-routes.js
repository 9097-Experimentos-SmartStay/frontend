// src/shared/presentation/routes/auth-routes.js
// Rutas de autenticación usando IAM bounded context

const LoginView = () => import('../../../iam/presentation/views/sign-in-form.vue');
const RegisterView = () => import('../../../iam/presentation/views/sign-up-form.vue');

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
];

