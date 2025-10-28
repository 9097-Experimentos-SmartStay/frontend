// src/modules/dashboard/routes.js

// Importa las vistas del dashboard desde la carpeta correcta dentro de este módulo
import AdminDashboard from './views/AdminDashboard.vue';
import StaffDashboard from './views/StaffDashboard.vue';
import GuestDashboard from './views/GuestDashboard.vue';

export default [
    // --- Ruta Central de Redirección ---
    {
        path: '/dashboard', // La ruta genérica a la que redirige el login y la guardia global
        name: 'dashboard', // Nombre usado por AuthForm.vue y guardias
        // Sin componente, solo la guarda beforeEnter para decidir a dónde ir
        beforeEnter: (to, from, next) => {
            const userRole = localStorage.getItem('user_role');
            console.log('[Router Guard /dashboard] Role:', userRole);

            if (!userRole) {
                console.log('[Router Guard /dashboard] No role, redirecting to login.');
                next({ name: 'login' }); // Si no hay rol, va a login
                return;
            }

            // Redirige al dashboard específico según el rol
            switch (userRole) {
                case 'admin':
                    console.log('[Router Guard /dashboard] Redirecting to admin-dashboard.');
                    next({ name: 'admin-dashboard' }); // Va a la ruta nombrada abajo
                    break;
                case 'staff':
                    console.log('[Router Guard /dashboard] Redirecting to staff-dashboard.');
                    next({ name: 'staff-dashboard' }); // Va a la ruta nombrada abajo
                    break;
                case 'guest':
                    console.log('[Router Guard /dashboard] Redirecting to guest-dashboard.');
                    next({ name: 'guest-dashboard' }); // Va a la ruta nombrada abajo
                    break;
                case 'visitor':
                    console.log('[Router Guard /dashboard] Visitor role, redirecting to login.');
                    next({ name: 'login' }); // Los visitantes no tienen dashboard, van a login
                    break;
                default:
                    console.warn('[Router Guard /dashboard] Unknown role:', userRole, 'Redirecting to login.');
                    localStorage.clear(); // Limpia por seguridad
                    next({ name: 'login' });
            }
        },
        meta: { requiresAuth: true } // Protege esta ruta de redirección
    },

    // --- Rutas Específicas del Dashboard (las que muestran las vistas) ---
    {
        path: '/admin/dashboard', // URL específica para admin
        name: 'admin-dashboard', // Nombre único
        component: AdminDashboard,
        meta: { requiresAuth: true, roles: ['admin'] } // Protegida para rol 'admin'
    },
    {
        path: '/staff/dashboard', // URL específica para staff
        name: 'staff-dashboard', // Nombre único
        component: StaffDashboard,
        meta: { requiresAuth: true, roles: ['staff', 'admin'] } // Protegida para 'staff' (y admin)
    },
    {
        path: '/guest/dashboard', // URL específica para guest
        name: 'guest-dashboard', // Nombre único
        component: GuestDashboard,
        meta: { requiresAuth: true, roles: ['guest', 'admin'] } // Protegida para 'guest' (y admin)
    },
];