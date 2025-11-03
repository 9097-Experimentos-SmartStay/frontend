// src/modules/property/presentation/components/useStaffRoomData.js
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import { PropertyService } from '../../application/PropertyService.js';
import { PropertyApiRepository } from '../../infrastructure/repositories/PropertyApiRepository.js';
import { BookingService } from '../../../booking/application/BookingService.js';
import { BookingApiRepository } from '../../../booking/infrastructure/repositories/BookingApiRepository.js';
import { UserService } from '../../../auth/application/UserService.js';
import { UserAPIRepository } from '../../../auth/infrastructure/repositories/user_api_repository.js';
import { ProfileApiRepository } from '../../../auth/infrastructure/repositories/ProfileApiRepository.js';

/**
 * Hook modular que carga y enriquece los datos
 * de habitaciones, reservas y perfiles de huéspedes.
 */
export function useStaffRoomData() {
    // --- Hooks ---
    const toast = useToast();
    const confirm = useConfirm();

    // --- Service Instantiation ---
    const propertyRepo = new PropertyApiRepository();
    const propertySvc = new PropertyService(propertyRepo);

    const bookingRepo = new BookingApiRepository();
    const bookingSvc = new BookingService(bookingRepo, propertyRepo);

    const userRepo = new UserAPIRepository();
    const profileRepo = new ProfileApiRepository();
    const userSvc = new UserService(userRepo, profileRepo, propertyRepo);

    // --- Estado crudo ---
    const allRooms = ref([]);
    const allBookings = ref([]);
    const allProfiles = ref([]);
    const loading = ref(true);

    // --- Cargar todos los datos ---
    async function loadAllData() {
        loading.value = true;
        try {
            const [roomsData, bookingsData, profilesData] = await Promise.all([
                propertySvc.getRoomList(),
                bookingSvc.getAllBookings(),
                userSvc.getGuestProfileList()
            ]);

            allRooms.value = roomsData || [];
            allBookings.value = bookingsData || [];
            allProfiles.value = profilesData || [];

            console.log('📦 Data loaded via useStaffRoomData:', {
                rooms: allRooms.value.length,
                bookings: allBookings.value.length,
                profiles: allProfiles.value.length
            });
        } catch (error) {
            console.error('❌ Error loading room data:', error);
            toast.add({
                severity: 'error',
                summary: 'Error cargando datos',
                detail: error.message,
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    onMounted(loadAllData);

    // --- Datos enriquecidos ---
    const enrichedRooms = computed(() => {
        if (!allRooms.value.length) return [];

        return allRooms.value.map(room => {
            const booking = allBookings.value.find(b => b.roomId === room.id);
            const guestProfile = booking
                ? allProfiles.value.find(p => p.id === booking.profileId)
                : null;

            return {
                ...room,
                booking,
                guestName: guestProfile?.fullName || null
            };
        });
    });

    // --- Filtro reactivo (puede refinarse desde el componente) ---
    const statusFilter = ref('All');
    const textFilter = ref('');

    const filteredRooms = computed(() => {
        let rooms = enrichedRooms.value;

        if (statusFilter.value !== 'All') {
            rooms = rooms.filter(r => r.status === statusFilter.value);
        }

        if (textFilter.value.trim()) {
            const query = textFilter.value.toLowerCase();
            rooms = rooms.filter(
                r =>
                    r.number.toLowerCase().includes(query) ||
                    (r.guestName && r.guestName.toLowerCase().includes(query))
            );
        }

        return rooms;
    });

    async function refreshRooms() {
        await loadAllData();
        toast.add({
            severity: "info",
            summary: "Datos actualizados",
            detail: "Se recargó la lista de habitaciones",
            life: 2000,
        });
    }

    // --- Retornar todo lo necesario ---
    return {
        // Datos crudos
        allRooms,
        allBookings,
        allProfiles,

        // Datos procesados
        enrichedRooms,
        filteredRooms,
        statusFilter,
        textFilter,

        // Estado de carga
        loading,

        // Servicios y utilidades
        propertySvc,
        toast,
        confirm,

        // Acciones
        refreshRooms
    };
}
