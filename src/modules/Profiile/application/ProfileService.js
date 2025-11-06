// Importa los "pies" (los repositorios de la capa de Infraestructura)
// ¡Usamos los "jugadores" que YA existen en tu módulo 'auth'!
import { UserAPIRepository } from '../../auth/infrastructure/repositories/user_api_repository.js';
import { ProfileApiRepository } from '../../auth/infrastructure/repositories/ProfileApiRepository.js';

export class ProfileService {
    constructor() {
        // Instancia las "armas" (los repos) que este "cerebro" controlará
        this.userRepo = new UserAPIRepository();
        this.profileRepo = new ProfileApiRepository();
    }

    /**
     * Táctica para obtener todos los datos de un perfil de usuario.
     * Combina dos "disparos" (user y profile) en uno.
     * @param {string} userId - El ID de la cuenta de usuario.
     */
    async getProfileData(userId) {
        if (!userId) throw new Error("User ID es requerido");

        console.log(`ProfileService: Buscando "química" para User ID: ${userId}`);

        // "Disparos" en paralelo para máxima velocidad
        const [user, profile] = await Promise.all([
            this.userRepo.getUserById(userId),          // "Pase" 1: Obtener /users/{id}
            this.profileRepo.getProfileByUserId(userId) // "Pase" 2: Obtener /profiles?user_id={id}
        ]);

        if (!user || !profile) {
            throw new Error("No se pudo encontrar la combinación de usuario y perfil.");
        }

        console.log('ProfileService: ¡"Química" encontrada!', { user, profile });
        return { user, profile };
    }

    /**
     * Táctica para actualizar el perfil y la cuenta.
     * @param {string} userId - ID de la cuenta /users
     * @param {string} profileId - ID del perfil /profiles
     * @param {object} data - Datos a guardar (email, full_name, password)
     */
    async updateProfileData(userId, profileId, data) {
        const { email, full_name, password } = data;

        const userDataToSave = { email };
        // "Táctica" condicional: solo "patea" la contraseña si el "jugador" la cambió
        if (password) {
            userDataToSave.password = password;
        }

        const profileDataToSave = { full_name };

        // "Disparos" en paralelo
        const [userSaveResponse, profileSaveResponse] = await Promise.all([
            this.userRepo.updateUser(userId, userDataToSave),
            this.profileRepo.updateProfile(profileId, profileDataToSave) // <-- Necesitaremos añadir esta "arma"
        ]);

        // Devuelve los "goles" (los datos actualizados)
        return { updatedUser: userSaveResponse, updatedProfile: profileSaveResponse };
    }
}