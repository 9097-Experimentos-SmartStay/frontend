// src/modules/auth/application/user_service.js
import { IUserRepository } from '../domain/repositories/i_user_repository.js'; // Ajusta si es interfaz
import { IProfileRepository } from '../domain/repositories/IProfileRepository.js'; // Interfaz de Profile
import { IPropertyRepository } from '../../property/domain/repositories/IPropertyRepository.js'; // Interfaz de Property (para tareas)

export class UserService {
    constructor(userRepository, profileRepository, propertyRepository) {
        if (!userRepository || !profileRepository || !propertyRepository) {
            throw new Error("UserRepository, ProfileRepository, and PropertyRepository are required.");
        }
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.propertyRepository = propertyRepository; // Para buscar tareas
    }

    // Obtiene detalles combinados SÓLO para staff
    async getStaffDetailsList() {
        console.log("UserService: Fetching staff details...");
        try {
            const allUsers = await this.userRepository.getAllUsers();
            const allProfiles = await this.profileRepository.getAllProfiles();
            const allTasks = await this.propertyRepository.getTasks();
            const staffUsers = allUsers.filter(user => user.role === 'staff');

            const staffDetails = staffUsers.map(staff => {
                const profile = allProfiles.find(p => p.user_id === staff.id);
                const assignedTasks = allTasks.filter(task => task.assignedTo === staff.id);
                const today = new Date().toISOString().split('T')[0];
                const roomsCleanedToday = assignedTasks.filter(task =>
                    task.status === 'Completada' &&
                    task.description.toLowerCase().includes('limpieza') &&
                    task.completedAt && task.completedAt.startsWith(today)
                ).length;

                // --- MODIFICACIÓN AQUÍ ---
                let shiftStatusKey = 'offShift'; // Clave por defecto (inglés)
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                if (profile && profile.shift_start && profile.shift_end) {
                    const [startH, startM] = profile.shift_start.split(':').map(Number);
                    const [endH, endM] = profile.shift_end.split(':').map(Number);
                    const startTimeMinutes = startH * 60 + startM;
                    const endTimeMinutes = endH * 60 + endM;
                    const currentTimeMinutes = currentHour * 60 + currentMinute;

                    if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes) {
                        shiftStatusKey = 'onShift'; // Clave en inglés
                    }
                }
                // --- FIN MODIFICACIÓN ---

                let displayStatus = profile?.current_status || 'unknown';
                if (shiftStatusKey === 'offShift') { // Compara con la clave
                    displayStatus = 'off_duty';
                }
                const currentTask = assignedTasks.find(task => task.status === 'Pendiente' || task.status === 'En proceso');

                return {
                    id: staff.id,
                    email: staff.email,
                    name: profile?.full_name || staff.email,
                    position: profile?.position || 'Staff',
                    shift: profile ? `${profile.shift_start} - ${profile.shift_end}` : 'N/A',
                    shiftStatus: shiftStatusKey, // <-- Devuelve la clave 'onShift' o 'offShift'
                    currentStatus: displayStatus,
                    currentTaskDescription: currentTask?.description || 'Ninguna',
                    roomsCleanedToday: roomsCleanedToday,
                };
            });

            console.log("UserService: Staff details processed:", staffDetails);
            return staffDetails;

        } catch (error) {
            console.error("Error in getStaffDetailsList:", error);
            throw error; // Re-lanza para que la vista maneje
        }
    }

    async deleteUserAndProfile(userId) {
        if (!userId) throw new Error("User ID is required for deletion.");
        console.log(`UserService: Deleting user and profile for ID: ${userId}`);
        try {
            // Borra primero el perfil (o viceversa, depende de constraints si fuera DB real)
            await this.profileRepository.deleteProfileByUserId(userId);
            // Luego borra el usuario
            await this.userRepository.deleteUser(userId);
            console.log(`UserService: Successfully deleted user and profile for ID: ${userId}`);
        } catch (error) {
            console.error(`UserService: Error deleting user ${userId}:`, error);
            // Podrías lanzar un error más específico o formateado
            throw new Error(`Failed to delete user: ${error.message || 'Unknown error'}`);
        }
    }

    // ... (otros métodos como getUserList, etc.)
}