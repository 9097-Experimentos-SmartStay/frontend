// src/modules/auth/application/UserService.js
import { IUserRepository } from '../domain/repositories/i_user_repository.js';
import { IProfileRepository } from '../domain/repositories/IProfileRepository.js'; // Ajusta capitalización si es i_profile_repository.js
import { IPropertyRepository } from '../../property/domain/repositories/IPropertyRepository.js'; // Ajusta capitalización si es i_property_repository.js

import { AuthService } from '../domain/services/authservice.js'; // Asegúrate que esta ruta es correcta

export class UserService {
    constructor(userRepository, profileRepository, propertyRepository) {
        if (!userRepository || !profileRepository || !propertyRepository) {
            throw new Error("UserRepository, ProfileRepository, and PropertyRepository are required.");
        }
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.propertyRepository = propertyRepository;
    }

    // Obtiene detalles combinados SÓLO para staff
    async getStaffDetailsList() {
        console.log("UserService: Fetching staff details...");
        try {
            // 1. Obtener todos los usuarios y perfiles
            const allUsers = await this.userRepository.getAllUsers();
            const allProfiles = await this.profileRepository.getAllProfiles();
            // 2. Obtener TODAS las tareas
            const allTasks = await this.propertyRepository.getTasks();

            // 3. Filtrar solo los usuarios con rol 'staff'
            const staffUsers = allUsers.filter(user => user.role === 'staff');

            // 4. Combinar datos y calcular estadísticas para cada staff
            const staffDetails = staffUsers.map(staff => {
                const profile = allProfiles.find(p => p.user_id === staff.id);
                const assignedTasks = allTasks.filter(task => task.assignedTo === staff.id);

                // Calcular habitaciones limpiadas HOY
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                const roomsCleanedToday = assignedTasks.filter(task =>
                    task.status === 'Completada' &&
                    task.description.toLowerCase().includes('limpieza') &&
                    task.completedAt && task.completedAt.startsWith(today)
                ).length;

                // Determinar estado del turno
                let shiftStatusKey = 'offShift'; // Clave por defecto
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

                // Determinar estado actual (basado en DB y turno)
                let displayStatus = profile?.current_status || 'unknown';
                if (shiftStatusKey === 'offShift') {
                    displayStatus = 'off_duty';
                }

                // Encontrar tarea actual (la última pendiente asignada) - Simplificación
                const currentTask = assignedTasks.find(task => task.status === 'Pendiente' || task.status === 'En proceso');


                return {
                    id: staff.id,
                    email: staff.email,
                    name: profile?.full_name || staff.email,
                    position: profile?.position || 'Staff',
                    shift: profile ? `${profile.shift_start} - ${profile.shift_end}` : 'N/A',
                    shiftStatus: shiftStatusKey,
                    currentStatus: displayStatus,
                    currentTaskDescription: currentTask?.description || 'Ninguna',
                    roomsCleanedToday: roomsCleanedToday,
                };
            });

            console.log("UserService: Staff details processed:", staffDetails);
            return staffDetails;

        } catch (error) {
            console.error("Error in getStaffDetailsList:", error);
            throw error;
        }
    }

    // --- MÉTODO MOVIDO DENTRO DE LA CLASE ---
    async registerUserAndProfile(userData, profileData) {
        console.log("UserService: Registering new user...");
        if (!userData.email || !userData.password || !userData.role) {
            throw new Error("Email, password, and role are required for user registration.");
        }

        let newUser = null;
        try {
            // Instancia temporal de AuthService para usar su lógica de registro
            const tempAuthService = new AuthService(this.userRepository);
            newUser = await tempAuthService.register(userData);
            console.log("UserService: User created:", newUser);

            // Crear perfil si hay datos y el usuario se creó
            if (newUser && newUser.id && profileData.full_name) {
                profileData.user_id = newUser.id; // Asocia el ID del usuario
                try {
                    // **IMPORTANTE**: Asegúrate de que IProfileRepository tenga el método 'createProfile'
                    // y que ProfileApiRepository lo implemente llamando a profileApi.postProfile(profileData)
                    await this.profileRepository.createProfile(profileData);
                    console.log("UserService: Profile created for user:", newUser.id);
                } catch (profileError) {
                    console.error("UserService: Failed to create profile after user registration:", profileError);
                    // Decide cómo manejar esto (podrías borrar el usuario recién creado o lanzar error específico)
                    throw new Error(`User created (ID: ${newUser.id}), but profile creation failed: ${profileError.message}`);
                }
            }
            return newUser; // Devuelve el usuario creado
        } catch (error) {
            console.error("UserService: Error during registration:", error);
            throw error; // Re-lanza el error
        }
    }
    // --- FIN MÉTODO MOVIDO ---

    async deleteUserAndProfile(userId) {
        if (!userId) throw new Error("User ID is required for deletion.");
        console.log(`UserService: Deleting user and profile for ID: ${userId}`);
        try {
            // **IMPORTANTE**: Asegúrate de que IProfileRepository tenga 'deleteProfileByUserId'
            // y que ProfileApiRepository lo implemente correctamente.
            await this.profileRepository.deleteProfileByUserId(userId);

            // **IMPORTANTE**: Asegúrate de que IUserRepository tenga 'deleteUser'
            // y que UserAPIRepository lo implemente correctamente.
            await this.userRepository.deleteUser(userId);

            console.log(`UserService: Successfully deleted user and profile for ID: ${userId}`);
        } catch (error) {
            console.error(`UserService: Error deleting user ${userId}:`, error);
            throw new Error(`Failed to delete user: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Fetches a list of all user profiles.
     * @returns {Promise<Array<object>>} A list of profile objects.
     */
    async getGuestProfileList() { // [NUEVO]
        // Asume que profileRepository.getProfiles() trae todos
        return await this.profileRepository.getProfiles();
    }

}