import {IamApi} from "../infrastructure/iam-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {SignInAssembler} from "../infrastructure/sign-in.assembler.js";
import {UserAssembler} from "../infrastructure/user.assembler.js";
import {SignUpAssembler} from "../infrastructure/sign-up.assembler.js";
import {SignInCommand} from "../domain/sign-in.command.js";
import {SignUpCommand} from "../domain/sign-up.command.js";

const iamApi = new IamApi();
/**
 * Pinia store for managing Identity and Access Management (IAM) state.
 * Handles user authentication, registration, and user data fetching.
 * @returns {Object} The store object with state and actions.
 */
const useIamStore = defineStore('iam', () => {
    /** @type {ref} */
    const users = ref([]);
    /** @type {ref} */
    const errors = ref([]);
    /** @type {ref} */
    const usersLoaded = ref(false);
    /** @type {ref} */
    const isSignedIn = ref(false);
    /** @type {string|null} */
    const currentUsername = ref(null);
    /** @type {number|null} */
    const currentUserId = ref(0);
    /** @type {computed} */
    const currentToken = computed(() => isSignedIn.value ? localStorage.getItem('token') : null);

    /**
     * Signs in a user with the provided credentials.
     * @param {SignInCommand} signInCommand - The sign-in command object.
     * @param router - The Vue router instance for navigation.
     * @throws {Error} If the sign-in fails.
     */
    function signIn(signInCommand, router) {
        // Implementation for sign-in action
        console.log(signInCommand);
        iamApi.signIn(signInCommand)
            .then(response => {
                let signInResource = SignInAssembler.toResourceFromResponse(response);
                if (signInResource) {
                    let currentUser = UserAssembler.toEntityFromResource(signInResource);
                    currentUsername.value = currentUser.username;
                    currentUserId.value = currentUser.id;
                    // Establecer token y rol en localStorage para compatibilidad con router guard
                    localStorage.setItem('token', signInResource.token);
                    localStorage.setItem('user_token', signInResource.token); // Compatibilidad
                    // Establecer rol - intentar obtenerlo de la respuesta o del usuario
                    const userRole = signInResource.role || currentUser.role || response.data?.role || 'guest';
                    localStorage.setItem('user_role', userRole);
                    // Guardar usuario completo para compatibilidad
                    localStorage.setItem('user', JSON.stringify({
                        id: currentUser.id,
                        username: currentUser.username,
                        email: signInResource.email || currentUser.email || currentUser.username,
                        name: currentUser.name || currentUser.username,
                        role: userRole
                    }));
                    isSignedIn.value = true;
                    console.log(`User signed in: ${currentUsername.value} with role: ${userRole}`);
                    errors.value = [];
                    router.push({name: 'dashboard'}); // Redirigir a dashboard en lugar de home
                } else {
                    isSignedIn.value = false;
                    console.log('Sign-in failed');
                    errors.value.push(new Error('Sign-in failed'));
                    router.push({name: 'login'}); // Usar nombre de ruta correcto
                }

            })
            .catch(error => {
                isSignedIn.value = false;
                currentUsername.value = error.name;
                console.log(error);
                errors.value.push(error);
                router.push({name: 'login'}); // Usar nombre de ruta correcto
            });
    }

    /**
     * Signs up a new user with the provided details.
     * @param {SignUpCommand} signUpCommand - The sign-up command object.
     * @param router - The Vue router instance for navigation.
     * @throws {Error} If the sign-up fails.
     */
    function signUp(signUpCommand, router) {
        // Implementation for sign-up action
        iamApi.signUp(signUpCommand)
            .then(response => {
                let signUpResource = SignUpAssembler.toResourceFromResponse(response);
                if (signUpResource) {
                    console.log(signUpResource.message);
                    errors.value = [];
                    router.push({name: 'login'}); // Usar nombre de ruta correcto
                } else {
                    console.log('Sign-up failed');
                    errors.value.push(new Error('Sign-up failed'));
                    router.push({name: 'register'}); // Usar nombre de ruta correcto
                }
            })
            .catch(error => {
                console.log(error);
                errors.value.push(error);
                router.push({name: 'register'}); // Usar nombre de ruta correcto
            });
    }

    /**
     * Signs out the current user.
     */
    function signOut(router) {
        currentUsername.value = null;
        currentUserId.value = 0;
        localStorage.removeItem('token');
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user');
        isSignedIn.value = false;
        console.log('User signed out');
        errors.value = [];
        router.push({name: 'login'}); // Usar nombre de ruta correcto
    }

    /**
     * Fetches all users from the API.
     * @throws {Error} If fetching users fails.
     */
    function fetchUsers() {
        iamApi.getUsers().then(response => {
            users.value = UserAssembler.toEntitiesFromResponse(response);
            usersLoaded.value = true;
            console.log(`Loaded ${users.value.length} users.`);
            errors.value = [];
        }).catch(error => {
            console.error('Error fetching users:', error);
            errors.value.push(error);
        });
    }

    return {
        users,
        errors,
        usersLoaded,
        currentUsername,
        currentUserId,
        currentToken,
        isSignedIn,
        signIn,
        signUp,
        signOut,
        fetchUsers
    };
});

export default useIamStore;
