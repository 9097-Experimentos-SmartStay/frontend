import {IamApi} from "../infrastructure/iam-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {SignInAssembler} from "../infrastructure/sign-in.assembler.js";
import {UserAssembler} from "../infrastructure/user.assembler.js";
import {SignUpAssembler} from "../infrastructure/sign-up.assembler.js";
import {resolveUserRole} from "../domain/user-role.js";
import {
    clearSession,
    getToken,
    getUserId,
    getUsername,
    saveSession
} from "@/shared/infrastructure/session/session-storage.js";

const iamApi = new IamApi();

/**
 * Pinia store for Identity and Access Management (IAM).
 * Handles sign-in, sign-up, sign-out and the user list.
 *
 * Actions return promises and throw on failure, so the views can show the real error.
 * Navigation is a presentation concern: views decide where to go after each action.
 */
const useIamStore = defineStore('iam', () => {

    /** @type {import('vue').Ref<Array>} List of users. */
    const users = ref([]);

    /** @type {import('vue').Ref<Array<Error>>} Errors of the last actions. */
    const errors = ref([]);

    /** @type {import('vue').Ref<boolean>} Flag indicating if users have been loaded. */
    const usersLoaded = ref(false);

    /** @type {import('vue').Ref<boolean>} Authentication status flag (restored from storage). */
    const isSignedIn = ref(!!getToken());

    /** @type {import('vue').Ref<string|null>} Current authenticated user's username. */
    const currentUsername = ref(getUsername());

    /** @type {import('vue').Ref<number>} Current authenticated user's ID. */
    const currentUserId = ref(getUserId() ?? 0);

    /** @type {import('vue').ComputedRef<string|null>} The current token. */
    const currentToken = computed(() => isSignedIn.value ? getToken() : null);

    /**
     * Signs in a user and persists the session.
     * @param {import('../domain/sign-in.command.js').SignInCommand} signInCommand
     * @returns {Promise<{id: number, username: string, role: string}>} The signed-in user.
     * @throws The HTTP error (e.g. 401) or an Error when the response is unusable.
     */
    async function signIn(signInCommand) {
        try {
            const response = await iamApi.signIn(signInCommand);
            const signInResource = SignInAssembler.toResourceFromResponse(response);
            if (!signInResource?.token) {
                throw new Error('Sign-in response has no token');
            }

            const currentUser = UserAssembler.toEntityFromResource(signInResource);
            const role = resolveUserRole(currentUser);

            saveSession({
                token: signInResource.token,
                userId: currentUser.id,
                username: currentUser.username,
                role
            });

            currentUsername.value = currentUser.username;
            currentUserId.value = currentUser.id;
            isSignedIn.value = true;
            errors.value = [];

            return {id: currentUser.id, username: currentUser.username, role};
        } catch (error) {
            isSignedIn.value = false;
            errors.value.push(error);
            throw error;
        }
    }

    /**
     * Registers a new user.
     * @param {import('../domain/sign-up.command.js').SignUpCommand} signUpCommand
     * @returns {Promise<import('../infrastructure/sign-up.resource.js').SignUpResource>}
     * @throws The HTTP error (e.g. 400/409) or an Error when the response is unusable.
     */
    async function signUp(signUpCommand) {
        try {
            const response = await iamApi.signUp(signUpCommand);
            const signUpResource = SignUpAssembler.toResourceFromResponse(response);
            if (!signUpResource) {
                throw new Error('Sign-up failed');
            }
            errors.value = [];
            return signUpResource;
        } catch (error) {
            errors.value.push(error);
            throw error;
        }
    }

    /**
     * Ends the session: clears storage and resets the state.
     * Also used when the API answers 401 on an authenticated request.
     */
    function signOut() {
        clearSession();
        currentUsername.value = null;
        currentUserId.value = 0;
        isSignedIn.value = false;
        errors.value = [];
    }

    /**
     * Fetches all users.
     * @returns {Promise<void>}
     */
    async function fetchUsers() {
        try {
            const response = await iamApi.getUsers();
            users.value = UserAssembler.toEntitiesFromResponse(response);
            usersLoaded.value = true;
            errors.value = [];
        } catch (error) {
            errors.value.push(error);
        }
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
