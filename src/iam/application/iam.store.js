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
 * Handles user authentication, registration, and user data fetching within the DDD architecture.
 * Uses the Resource pattern for data transfer and Entities for domain logic.
 * * @returns {Object} The store object with reactive state and actions.
 */
const useIamStore = defineStore('iam', () => {

    // --- STATE INITIALIZATION (MEMORY RECOVERY) ---
    // We initialize the state from LocalStorage to maintain the session across page reloads.
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('user_id');
    const storedUsername = localStorage.getItem('user_username');

    /** @type {ref<Array>} List of user entities. */
    const users = ref([]);

    /** @type {ref<Array<Error>>} List of application errors. */
    const errors = ref([]);

    /** @type {ref<boolean>} Flag indicating if users have been loaded. */
    const usersLoaded = ref(false);

    /** @type {ref<boolean>} Authentication status flag. */
    const isSignedIn = ref(!!storedToken);

    /** @type {ref<string|null>} Current authenticated user's username. */
    const currentUsername = ref(storedUsername || null);

    /** @type {ref<number>} Current authenticated user's ID. */
    const currentUserId = ref(storedUserId ? Number(storedUserId) : 0);

    /** @type {computed<string|null>} Computed property for the current token. */
    const currentToken = computed(() => isSignedIn.value ? localStorage.getItem('token') : null);

    /**
     * Signs in a user with the provided credentials.
     * Transforming the Infrastructure Response into a Domain Entity via Assemblers.
     * * @param {SignInCommand} signInCommand - The command containing credentials.
     * @param {Object} router - The Vue Router instance for navigation.
     */
    function signIn(signInCommand, router) {
        console.log("Executing SignIn Command:", signInCommand);

        iamApi.signIn(signInCommand)
            .then(response => {
                // Transform Response to Resource
                let signInResource = SignInAssembler.toResourceFromResponse(response);

                if (signInResource) {
                    // Transform Resource to Domain Entity
                    let currentUser = UserAssembler.toEntityFromResource(signInResource);

                    // Update Reactive State
                    currentUsername.value = currentUser.username;
                    currentUserId.value = currentUser.id;
                    isSignedIn.value = true;

                    // --- PERSISTENCE LAYER (LOCAL STORAGE) ---
                    // Vital for session recovery on page reload
                    localStorage.setItem('token', signInResource.token);
                    localStorage.setItem('user_token', signInResource.token); // Compatibility
                    localStorage.setItem('user_id', currentUser.id); // <--- ¡AQUÍ ESTABA LA CLAVE!
                    localStorage.setItem('user_username', currentUser.username);

                    // Determine Role (Defaulting to 'guest' if not provided by backend resource)
                    const role = currentUser.roles ? currentUser.roles[0] : 'guest';
                    localStorage.setItem('user_role', role);

                    console.log(`User signed in successfully: ID ${currentUser.id}, Role: ${role}`);
                    errors.value = [];

                    // Navigate to Dashboard
                    router.push({name: 'dashboard'});
                } else {
                    handleSignInError(new Error('Sign-in resource is null'), router);
                }
            })
            .catch(error => {
                handleSignInError(error, router);
            });
    }

    /**
     * Helper to handle sign-in failures.
     * @param {Error} error - The error object.
     * @param {Object} router - Router instance.
     */
    function handleSignInError(error, router) {
        isSignedIn.value = false;
        console.error("Sign-in failed:", error);
        errors.value.push(error);
        router.push({name: 'login'});
    }

    /**
     * Signs up a new user.
     * * @param {SignUpCommand} signUpCommand - The command containing registration details.
     * @param {Object} router - The Vue Router instance.
     */
    function signUp(signUpCommand, router) {
        iamApi.signUp(signUpCommand)
            .then(response => {
                let signUpResource = SignUpAssembler.toResourceFromResponse(response);

                if (signUpResource) {
                    console.log("Sign-up successful:", signUpResource.message);
                    errors.value = [];
                    router.push({name: 'login'});
                } else {
                    console.warn('Sign-up resource returned null');
                    errors.value.push(new Error('Sign-up failed'));
                    router.push({name: 'register'});
                }
            })
            .catch(error => {
                console.error("Sign-up error:", error);
                errors.value.push(error);
                router.push({name: 'register'});
            });
    }

    /**
     * Signs out the current user and clears persistence layer.
     * @param {Object} router - The Vue Router instance.
     */
    function signOut(router) {
        // Reset State
        currentUsername.value = null;
        currentUserId.value = 0;
        isSignedIn.value = false;

        // Clear Persistence
        localStorage.removeItem('token');
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id'); // <--- Limpieza completa
        localStorage.removeItem('user_username');

        console.log('User session terminated');
        errors.value = [];
        router.push({name: 'login'});
    }

    /**
     * Fetches all users from the API and maps them to Domain Entities.
     */
    function fetchUsers() {
        iamApi.getUsers().then(response => {
            users.value = UserAssembler.toEntitiesFromResponse(response);
            usersLoaded.value = true;
            console.log(`Loaded ${users.value.length} user entities.`);
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