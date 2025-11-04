import AdminManageRooms from './views/AdminManageRooms.vue';
import GuestRoomList from './views/GuestRoomList.vue';
import StaffRoomCleaningList from './views/StaffRoomCleaningList.vue';
import StaffTaskList from './views/StaffTaskList.vue';

export default [
    {
        path: '/admin/property/rooms',
        name: 'admin-manage-rooms',
        component: AdminManageRooms,
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        path: '/guest/property/list', // Ruta para que huéspedes vean propiedades
        name: 'guest-property-list',
        component: GuestRoomList,
        meta: { requiresAuth: true, roles: ['guest', 'admin'] } // Huéspedes y admin pueden ver
    },
    {
        path: '/staff/property/cleaning',
        name: 'staff-room-cleaning',
        component: StaffRoomCleaningList,
        meta: { requiresAuth: true, roles: ['staff', 'admin'] }
    },
    {
        path: '/staff/property/tasks',
        name: 'staff-task-list',
        component: StaffTaskList,
        meta: { requiresAuth: true, roles: ['staff', 'admin'] }
    },
    {
        path: "/guest/rooms",
        name: "guest-rooms-list", // El nombre que usamos en goToRooms()
        component: () => import("./views/GuestRoomList.vue"), // El archivo que crearemos
        meta: { requiresAuth: true, roles: ['guest'] }
    },
    // ... otras rutas de property (ej: detalle de habitación '/property/room/:id')
];