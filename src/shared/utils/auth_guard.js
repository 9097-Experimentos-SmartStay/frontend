export function authGuard(to, from, next, expectedRole) {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        alert('Debe iniciar sesión primero.');
        return next('/login');
    }

    const user = JSON.parse(storedUser);
    if (user.role !== expectedRole) {
        alert('No tiene permisos para acceder a esta sección.');
        return next(`/login`);
    }

    next();
}
