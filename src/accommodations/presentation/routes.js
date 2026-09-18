import { AppArea, Capability } from '@/iam/domain/user-role.js';

const guest = { requiresAuth: true, area: AppArea.GUEST };
const staff = (capability) => ({ requiresAuth: true, area: AppArea.STAFF, capability });

export default [
    // Guest area
    {
        path: '/guest/hotels',
        name: 'guest-hotels',
        component: () => import('./views/GuestHotels.vue'),
        meta: guest
    },
    {
        path: '/guest/accommodations/rooms',
        name: 'guest-rooms',
        component: () => import('./views/GuestRooms.vue'),
        meta: guest
    },
    {
        path: '/guest/accommodations/rooms/:roomId',
        name: 'guest-room-detail',
        component: () => import('./views/GuestRoomDetail.vue'),
        meta: guest,
        props: true
    },
    // Staff area
    {
        path: '/staff/hotels',
        name: 'staff-hotels',
        component: () => import('./views/StaffHotels.vue'),
        meta: staff(Capability.VIEW_HOTELS)
    },
    {
        path: '/staff/hotels/new',
        name: 'create-hotel',
        component: () => import('./views/StaffCreateHotel.vue'),
        meta: staff(Capability.REGISTER_HOTEL)
    },
    {
        path: '/staff/hotels/:hotelId/edit',
        name: 'edit-hotel',
        component: () => import('./views/StaffEditHotel.vue'),
        meta: staff(Capability.MANAGE_HOTELS),
        props: true
    },
    {
        path: '/staff/hotels/:hotelId/payment-settings',
        name: 'hotel-payment-settings',
        component: () => import('./views/StaffHotelPaymentSettings.vue'),
        meta: staff(Capability.VIEW_PAYMENT_SETTINGS),
        props: true
    },
    {
        path: '/staff/rooms',
        name: 'staff-rooms',
        component: () => import('./views/StaffRooms.vue'),
        meta: staff(Capability.VIEW_ROOMS)
    },
    {
        path: '/staff/rooms/map',
        name: 'staff-room-map',
        component: () => import('./views/StaffRoomMap.vue'),
        meta: staff(Capability.VIEW_ROOM_MAP)
    },
    {
        path: '/staff/rooms/new',
        name: 'create-room',
        component: () => import('./views/StaffCreateRoom.vue'),
        meta: staff(Capability.MANAGE_ROOMS)
    },
    {
        path: '/staff/rooms/:roomId/edit',
        name: 'edit-room',
        component: () => import('./views/StaffEditRoom.vue'),
        meta: staff(Capability.MANAGE_ROOMS),
        props: true
    }
];
