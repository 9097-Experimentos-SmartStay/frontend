import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';

import { ProfileService } from '../../application/ProfileService.js';

export function useAdminProfile() {
    const toast = useToast();

    // ¡Instancia al "Director Técnico"!
    const profileService = new ProfileService();

    // Estado del "Jugador" (Sigue igual)
    const loading = ref(true);
    const saving = ref(false);
    const user = ref({ id: null, email: '', role: '' });
    const profile = ref({ id: null, user_id: null, full_name: '' });
    const password = ref('');

    // "Táctica" para obtener el ID (Sigue igual)
    function getLocalUser() {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            throw new Error('No se encontró al usuario. Por favor, inicia sesión de nuevo.');
        }
        return JSON.parse(storedUser);
    }

    // "Táctica" de Carga (¡"EVOLUCIONADA"!)
    onMounted(async () => {
        loading.value = true;
        try {
            const localUser = getLocalUser();

            // ¡Ahora "pasa el balón" al "Director Técnico"!
            const { user: userData, profile: profileData } = await profileService.getProfileData(localUser.id);

            user.value = userData;
            profile.value = profileData;

            console.log('Perfil cargado:', profile.value);

        } catch (error) {
            console.error("Error cargando el perfil:", error);
            toast.add({ severity: 'error', summary: 'Error de Carga', detail: error.message, life: 3000 });
        } finally {
            loading.value = false;
        }
    });

    // "Táctica" de Guardado (¡"EVOLUCIONADA"!)
    async function saveProfile() {
        saving.value = true;
        try {
            const localUser = getLocalUser();

            // 1. Prepara el "pase" (los datos)
            const dataToSave = {
                email: user.value.email,
                full_name: profile.value.full_name,
                password: password.value || null // Envía null si está vacío
            };

            // 2. ¡"Pasa el balón" al "Director Técnico"!
            const { updatedUser, updatedProfile } = await profileService.updateProfileData(
                localUser.id,
                profile.value.id,
                dataToSave
            );

            // 3. "Gol": Actualiza el "marcador" (localStorage)
            const updatedLocalUser = {
                ...localUser,
                email: updatedUser.email,
                name: updatedProfile.full_name,
            };
            localStorage.setItem('user', JSON.stringify(updatedLocalUser));

            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente.', life: 3000 });
            password.value = ''; // Limpia el "arma"

        } catch (error) {
            console.error("Error guardando el perfil:", error);
            toast.add({ severity: 'error', summary: 'Error al Guardar', detail: 'No se pudo actualizar el perfil.', life: 3000 });
        } finally {
            saving.value = false;
        }
    }

    // "Táctica" del Avatar (Sigue igual)
    const avatarLabel = computed(() => {
        // ... (tu lógica de avatar está perfecta)
        const name = profile.value.full_name || user.value.email || '';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] || '') + (parts[parts.length - 1][0] || '');
        }
        return (name[0] || '') + (name[1] || '');
    });

    // Devuelve las "armas"
    return {
        loading,
        saving,
        user,
        profile,
        password,
        avatarLabel,
        saveProfile
    };
}