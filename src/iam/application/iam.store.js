import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { AuthenticationApi } from '../infrastructure/api/authentication-api.js';
import { SessionAssembler } from '../infrastructure/assemblers/session.assembler.js';
import { AuthFailure, AuthFailureReason } from './auth-failure.js';
import { areaFor, can as roleCan } from '../domain/user-role.js';
import { clearSession, loadSession, saveSession } from '@/shared/infrastructure/session/session-storage.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const authenticationApi = new AuthenticationApi();

/** Result of opening the link of the verification e-mail (US-01). */
export const EmailVerificationResult = Object.freeze({
    VERIFIED: 'verified',
    EXPIRED: 'expired',
    INVALID: 'invalid',
});

/**
 * IAM store: the session of this browser and the anonymous account flows (US-01, US-02, US-04).
 *
 * Actions throw {@link AuthFailure} (business reason + details) so views never read HTTP statuses.
 * Navigation is a presentation concern: views decide where to go after each action.
 */
const useIamStore = defineStore('iam', () => {
    /** @type {import('vue').Ref<import('../domain/model/session.entity.js').Session|null>} */
    const session = ref(SessionAssembler.fromStored(loadSession()));

    const currentUser = computed(() => session.value?.user ?? null);
    const currentUserId = computed(() => currentUser.value?.id ?? null);
    const role = computed(() => currentUser.value?.role ?? null);
    const area = computed(() => areaFor(role.value));
    const isSignedIn = computed(() => !!session.value);
    const isRemembered = computed(() => !!session.value?.remembered);

    /**
     * @param {string} capability - One of Capability (user-role.js).
     * @returns {boolean}
     */
    function can(capability) {
        return roleCan(role.value, capability);
    }

    function persist(newSession) {
        session.value = newSession;
        if (newSession) {
            saveSession(SessionAssembler.toStored(newSession));
        } else {
            clearSession();
        }
    }

    // Another tab signed in, refreshed or signed out: follow it.
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', () => {
            session.value = SessionAssembler.fromStored(loadSession());
        });
    }

    /**
     * US-02: signs in and persists the session (localStorage with "Recordarme", sessionStorage without).
     * @param {import('../domain/commands/sign-in.command.js').SignInCommand} command
     * @returns {Promise<import('../domain/model/user.entity.js').User>}
     * @throws {AuthFailure} invalidCredentials | accountLocked | accountDeactivated | invalidData | rateLimited | ...
     */
    async function signIn(command) {
        try {
            const response = await authenticationApi.signIn(command);
            const newSession = SessionAssembler.toEntityFromResponse(response);
            if (!newSession.user.role) {
                throw new Error('Unknown role in the sign-in response');
            }
            persist(newSession);
            return newSession.user;
        } catch (error) {
            const failure = AuthFailure.from(error, { 403: AuthFailureReason.ACCOUNT_DEACTIVATED });
            if (failure.problem.status === 401) {
                // Same 401 for a wrong e-mail or password; the lock adds `lockedUntil` (§0.1).
                failure.reason = failure.lockedUntil
                    ? AuthFailureReason.ACCOUNT_LOCKED
                    : AuthFailureReason.INVALID_CREDENTIALS;
            }
            throw failure;
        }
    }

    /**
     * US-01: creates a guest account. No token comes back: the user confirms the e-mail and signs in.
     * @param {import('../domain/commands/sign-up.command.js').SignUpCommand} command
     * @returns {Promise<{email: string, emailVerified: boolean}>}
     * @throws {AuthFailure} emailAlreadyRegistered | invalidData | rateLimited | ...
     */
    async function signUp(command) {
        try {
            const { data } = await authenticationApi.signUp(command);
            return { email: data?.email ?? command.email, emailVerified: !!data?.emailVerified };
        } catch (error) {
            throw AuthFailure.from(error, { 409: AuthFailureReason.EMAIL_ALREADY_REGISTERED });
        }
    }

    /**
     * Renews a remembered session (called by the HTTP client, serialized there).
     * Reads the storage again first: another tab may have rotated the refresh token already.
     * @returns {Promise<string>} The new access token.
     * @throws {Error} When the session is not remembered or the refresh token was rejected.
     */
    async function refreshSession() {
        const stored = SessionAssembler.fromStored(loadSession());
        if (!stored?.refreshToken) {
            throw new Error('No remembered session to refresh');
        }
        const response = await authenticationApi.refresh(stored.refreshToken);
        const renewed = SessionAssembler.toEntityFromResponse(response);
        persist(renewed);
        return renewed.accessToken;
    }

    /**
     * Signs out on purpose: revokes the remembered session in the backend (if any) and clears this browser.
     * The access token is just discarded (it expires within 30 minutes).
     * @returns {Promise<void>}
     */
    async function signOut() {
        const refreshToken = session.value?.refreshToken ?? loadSession()?.refreshToken;
        persist(null);
        if (refreshToken) {
            try {
                await authenticationApi.signOut(refreshToken);
            } catch (error) {
                reportError('Error revoking the remembered session', error);
            }
        }
    }

    /** Ends the session locally when the API rejected it (401). Nothing to revoke. */
    function endSession() {
        persist(null);
    }

    /**
     * Updates the signed-in user after a change the backend applies from the next request
     * (e.g. an admin registering their hotel becomes its admin, D2).
     * @param {Partial<import('../domain/model/user.entity.js').User>} changes
     */
    function updateCurrentUser(changes) {
        if (!session.value) return;
        persist(session.value.withUser(session.value.user.with(changes)));
    }

    /**
     * US-01: confirms the e-mail with the token of the link.
     * @param {string} token
     * @returns {Promise<string>} One of {@link EmailVerificationResult}.
     * @throws {AuthFailure} Only for network/server/rate-limit problems.
     */
    async function verifyEmail(token) {
        try {
            await authenticationApi.verifyEmail(token);
            if (session.value) updateCurrentUser({ emailVerified: true });
            return EmailVerificationResult.VERIFIED;
        } catch (error) {
            const failure = AuthFailure.from(error, {
                400: AuthFailureReason.LINK_INVALID,
                410: AuthFailureReason.LINK_EXPIRED,
            });
            if (failure.reason === AuthFailureReason.LINK_EXPIRED) return EmailVerificationResult.EXPIRED;
            if (failure.reason === AuthFailureReason.LINK_INVALID) return EmailVerificationResult.INVALID;
            throw failure;
        }
    }

    /**
     * Sends a new verification link (always 202: the API never reveals whether the account exists).
     * @param {string} email
     * @returns {Promise<void>}
     */
    async function resendVerification(email) {
        try {
            await authenticationApi.resendVerification(email);
        } catch (error) {
            throw AuthFailure.from(error);
        }
    }

    /**
     * US-04 scenarios 1–2: asks for a reset link. Same outcome for registered and unknown e-mails.
     * @param {string} email
     * @returns {Promise<void>}
     */
    async function requestPasswordRecovery(email) {
        try {
            await authenticationApi.requestPasswordRecovery(email);
        } catch (error) {
            throw AuthFailure.from(error);
        }
    }

    /**
     * US-04 scenarios 3–4: sets the new password. Every session of the account is revoked by the backend,
     * so a session open in this browser is ended too.
     * @param {import('../domain/commands/reset-password.command.js').ResetPasswordCommand} command
     * @returns {Promise<void>}
     * @throws {AuthFailure} linkExpired | linkInvalid | invalidData | ...
     */
    async function resetPassword(command) {
        try {
            await authenticationApi.resetPassword(command);
            persist(null);
        } catch (error) {
            const failure = AuthFailure.from(error, { 410: AuthFailureReason.LINK_EXPIRED });
            if (failure.problem.status === 400 && !failure.problem.hasFieldErrors) {
                failure.reason = AuthFailureReason.LINK_INVALID;
            }
            throw failure;
        }
    }

    return {
        session,
        currentUser,
        currentUserId,
        role,
        area,
        isSignedIn,
        isRemembered,
        can,
        signIn,
        signUp,
        refreshSession,
        signOut,
        endSession,
        updateCurrentUser,
        verifyEmail,
        resendVerification,
        requestPasswordRecovery,
        resetPassword,
    };
});

export default useIamStore;
