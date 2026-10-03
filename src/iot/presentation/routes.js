import { AppArea, Capability } from '@/iam/domain/user-role.js';

/**
 * Room IoT routes (US-11 for the guest, US-19 signals on the operations board).
 *
 * The emulator is the only live room hardware this API offers, so both screens degrade to a single
 * "simulation not available" notice when it is not deployed.
 */
export default [
    {
        // US-11: the guest sets the climate of the room of their current stay.
        path: '/guest/room-climate',
        name: 'guest-room-climate',
        component: () => import('./views/GuestRoomClimate.vue'),
        meta: { requiresAuth: true, area: AppArea.GUEST, capability: Capability.CONTROL_ROOM_CLIMATE }
    },
    {
        // Shift board: reception, housekeeping and maintenance get a screen of their own here.
        path: '/staff/operations',
        name: 'staff-operations',
        component: () => import('./views/StaffOperationsBoard.vue'),
        meta: { requiresAuth: true, area: AppArea.STAFF, capability: Capability.VIEW_OPERATIONS_BOARD }
    }
];
