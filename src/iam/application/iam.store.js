import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { AuthenticationApi } from '../infrastructure/api/authentication-api.js';
import { UsersApi } from '../infrastructure/api/users-api.js';
import { SessionAssembler } from '../infrastructure/assemblers/session.assembler.js';
import { MfaAssembler } from '../infrastructure/assemblers/mfa.assembler.js';
import { AuthFailure, AuthFailureReason } from './auth-failure.js';
import { areaFor, can as roleCan } from '../domain/user-role.js';
import { clearSession, loadSession, saveSession } from '@/shared/infrastructure/session/session-storage.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';
import { ProblemDetails } from '@/shared/infrastructure/http/problem-details.js';

const authenticationApi = new AuthenticationApi();
const usersApi = new UsersApi();

/** Result of opening the link of the verification e-mail (US-01). */
export const EmailVerificationResult = Object.freeze({
    VERIFIED: 'verified',
    EXPIRED: 'expired',
    INVALID: 'invalid',
});

/** How the password step of a sign-in ended (US-02 scenario 1, US-52). */
export const SignInStatus = Object.freeze({
    SIGNED_IN: 'signedIn',
    SECOND_FACTOR_REQUIRED: 'secondFactorRequired',
});

/** Error codes of the account endpoints (§0 code catalog) → business reason of the failure. */
const REASON_BY_CODE = Object.freeze({
    'auth.invalid_credentials': AuthFailureReason.INVALID_CREDENTIALS,
    'auth.account_locked': AuthFailureReason.ACCOUNT_LOCKED,
    'auth.account_deactivated': AuthFailureReason.ACCOUNT_DEACTIVATED,
    'auth.email_not_verified': AuthFailureReason.EMAIL_NOT_VERIFIED,
    'user.email_already_registered': AuthFailureReason.EMAIL_ALREADY_REGISTERED,
    'email_verification.link_invalid': AuthFailureReason.LINK_INVALID,
    'email_verification.link_expired': AuthFailureReason.LINK_EXPIRED,
    'password_reset.link_invalid': AuthFailureReason.LINK_INVALID,
    'password_reset.link_expired': AuthFailureReason.LINK_EXPIRED,
    'mfa.invalid_code': AuthFailureReason.MFA_CODE_INVALID,
    'mfa.code_already_used': AuthFailureReason.MFA_CODE_ALREADY_USED,
    'mfa.recovery_code_invalid': AuthFailureReason.MFA_RECOVERY_CODE_INVALID,
    'mfa.already_enabled': AuthFailureReason.MFA_ALREADY_ENABLED,
    'mfa.enrollment_not_started': AuthFailureReason.MFA_ENROLLMENT_NOT_STARTED,
});

/**
 * Translates an error of the account endpoints by its code; unknown codes keep the generic reason of the status.
 * @param {unknown} error
 * @param {Record<number, string>} [reasonByStatus]
 * @returns {AuthFailure}
 */
function accountFailure(error, reasonByStatus = {}) {
    const failure = AuthFailure.from(error, reasonByStatus);
    const reason = REASON_BY_CODE[failure.problem.code];
    if (reason) failure.reason = reason;
    return failure;
}

/**
 * Meaning of a failed MFA call. Besides the MFA codes, the mfaToken itself being rejected (missing, invalid,
 * expired, or an enrollment token on /verify: 401/403 `auth.*`) means: repeat the password step.
 * @param {unknown} error
 * @returns {AuthFailure}
 */
function mfaFailure(error) {
    const failure = accountFailure(error);
    const { problem } = failure;
    if (!REASON_BY_CODE[problem.code] && (problem.status === 401 || problem.status === 403)) {
        failure.reason = AuthFailureReason.MFA_CHALLENGE_EXPIRED;
    }
    return failure;
}

/**
 * IAM store: the session of this browser and the anonymous account flows (US-01, US-02, US-04).
 *
 * Actions throw {@link AuthFailure} (business reason + details) so views never read HTTP statuses.
 * Navigation is a presentation concern: views decide where to go after each action.
 */
const useIamStore = defineStore('iam', () => {
    /**
     * Restores the stored session. A session without "Recordarme" whose access token already expired
     * cannot be renewed, so it is dropped here instead of failing on the first request.
     * @returns {import('../domain/model/session.entity.js').Session|null}
     */
    function restoreSession() {
        const restored = SessionAssembler.fromStored(loadSession());
        if (restored && !restored.remembered && restored.isAccessTokenExpired()) {
            clearSession();
            return null;
        }
        return restored;
    }

    /** @type {import('vue').Ref<import('../domain/model/session.entity.js').Session|null>} */
    const session = ref(restoreSession());

    /**
     * Second step of a staff sign-in (US-52). Memory only: the mfaToken is never stored, so reloading the
     * page (or waiting more than 10 minutes) means signing in with the password again.
     * @type {import('vue').Ref<import('../domain/model/mfa-challenge.js').MfaChallenge|null>}
     */
    const pendingChallenge = ref(null);

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
            session.value = restoreSession();
        });
    }

    /**
     * US-02: checks the password. A guest gets a session right away (localStorage with "Recordarme",
     * sessionStorage without). A staff account gets a second-factor challenge instead (US-52): enrollment
     * of an authenticator app the first time, a code afterwards.
     * @param {import('../domain/commands/sign-in.command.js').SignInCommand} command
     * @returns {Promise<{status: string, user?: import('../domain/model/user.entity.js').User, challenge?: import('../domain/model/mfa-challenge.js').MfaChallenge}>}
     *   `status` is one of {@link SignInStatus}.
     * @throws {AuthFailure} invalidCredentials | accountLocked | accountDeactivated | emailNotVerified | invalidData | rateLimited | ...
     */
    async function signIn(command) {
        pendingChallenge.value = null;
        let response;
        try {
            response = await authenticationApi.signIn(command);
        } catch (error) {
            // auth.invalid_credentials (same for a wrong e-mail or password), auth.account_locked (+ lockedUntil),
            // auth.account_deactivated, auth.email_not_verified.
            throw accountFailure(error);
        }

        const challenge = MfaAssembler.toChallengeFromSignIn(response?.data, command);
        if (challenge) {
            pendingChallenge.value = challenge;
            return { status: SignInStatus.SECOND_FACTOR_REQUIRED, challenge };
        }
        return { status: SignInStatus.SIGNED_IN, user: startSession(response) };
    }

    /**
     * Turns a response that carries tokens (sign-in, MFA confirmation or verification) into the session.
     * @param {Object} response
     * @returns {import('../domain/model/user.entity.js').User}
     */
    function startSession(response) {
        const newSession = SessionAssembler.toEntityFromResponse(response);
        if (!newSession.user.role) {
            throw new AuthFailure(AuthFailureReason.UNEXPECTED, ProblemDetails.fromError(new Error('Unknown role in the sign-in response')));
        }
        pendingChallenge.value = null;
        persist(newSession);
        return newSession.user;
    }

    /**
     * @returns {import('../domain/model/mfa-challenge.js').MfaChallenge}
     * @throws {AuthFailure} mfaChallengeExpired when there is no usable challenge (reload, 10 minutes passed).
     */
    function activeChallenge() {
        const challenge = pendingChallenge.value;
        if (!challenge || challenge.isExpired()) {
            pendingChallenge.value = null;
            throw new AuthFailure(AuthFailureReason.MFA_CHALLENGE_EXPIRED, new ProblemDetails({ status: null }));
        }
        return challenge;
    }

    /**
     * US-52 scenario 1, step 1: gets the secret and the otpauth URI to scan.
     * @returns {Promise<import('../domain/model/totp-enrollment.js').TotpEnrollment>}
     * @throws {AuthFailure} mfaChallengeExpired | mfaAlreadyEnabled | rateLimited | ...
     */
    async function startMfaEnrollment() {
        const challenge = activeChallenge();
        try {
            return MfaAssembler.toEnrollmentFromResponse(await authenticationApi.startMfaEnrollment(challenge.token));
        } catch (error) {
            throw mfaFailure(error);
        }
    }

    /**
     * US-52 scenario 1, step 2: confirms the app with its first code. The session starts here, and the
     * recovery codes come back ONCE: the caller must show them before leaving the page.
     * @param {import('../domain/commands/verify-second-factor.command.js').ConfirmMfaEnrollmentCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/totp-enrollment.js').RecoveryCodes>}
     * @throws {AuthFailure} mfaCodeInvalid | mfaEnrollmentNotStarted | mfaChallengeExpired | accountLocked | ...
     */
    async function confirmMfaEnrollment(command) {
        const challenge = activeChallenge();
        let response;
        try {
            response = await authenticationApi.confirmMfaEnrollment(challenge.token, command.code);
        } catch (error) {
            throw mfaFailure(error);
        }
        const recoveryCodes = MfaAssembler.toRecoveryCodesFromResponse(response);
        startSession(response);
        return recoveryCodes;
    }

    /**
     * US-52 scenarios 2 and 3: second step with an authenticator code or a single-use recovery code.
     * Failures count toward the account lock of US-02 (5 in a row).
     * @param {import('../domain/commands/verify-second-factor.command.js').VerifySecondFactorCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/user.entity.js').User>}
     * @throws {AuthFailure} mfaCodeInvalid | mfaCodeAlreadyUsed | mfaRecoveryCodeInvalid | accountLocked | mfaChallengeExpired | ...
     */
    async function verifySecondFactor(command) {
        const challenge = activeChallenge();
        let response;
        try {
            response = await authenticationApi.verifyMfa(challenge.token, MfaAssembler.toVerifyResource(command));
        } catch (error) {
            const failure = mfaFailure(error);
            if (failure.reason === AuthFailureReason.MFA_CHALLENGE_EXPIRED) pendingChallenge.value = null;
            throw failure;
        }
        return startSession(response);
    }

    /** The user leaves the second step (back to the password form). */
    function abandonSecondFactor() {
        pendingChallenge.value = null;
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
            throw accountFailure(error);
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

    /**
     * "Cerrar sesión en todos los dispositivos" (§2.5a): every access token and remembered session of the
     * account stops working, this browser included.
     * @returns {Promise<void>}
     * @throws {AuthFailure} When the API could not do it (the local session is kept so the user can retry).
     */
    async function signOutEverywhere() {
        try {
            await authenticationApi.signOutEverywhere();
        } catch (error) {
            throw AuthFailure.from(error);
        }
        persist(null);
    }

    /**
     * Changes the password of the signed-in user. The backend bumps the session generation, so the session of
     * this browser ends too and the user signs in again with the new password.
     * @param {import('../domain/commands/change-password.command.js').ChangePasswordCommand} command - Already validated.
     * @returns {Promise<void>}
     * @throws {AuthFailure} wrongCurrentPassword | invalidData (errors.newPassword, policy §2.0) | rateLimited | ...
     */
    async function changePassword(command) {
        try {
            // Its 401 "Invalid credentials" is the wrong current password (the HTTP client leaves it to us).
            await usersApi.changePassword(command);
        } catch (error) {
            const failure = accountFailure(error);
            // Here auth.invalid_credentials means the current password is wrong (the session is fine).
            if (failure.reason === AuthFailureReason.INVALID_CREDENTIALS) failure.reason = AuthFailureReason.WRONG_CURRENT_PASSWORD;
            throw failure;
        }
        persist(null);
    }

    /** Ends the session locally when the API rejected it (401). Nothing to revoke. */
    function endSession() {
        persist(null);
    }

    /**
     * Updates profile data of the signed-in user kept in the session (e-mail verified, fresh profile).
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
            const failure = accountFailure(error);
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
            throw accountFailure(error);
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
        pendingChallenge,
        can,
        signIn,
        startMfaEnrollment,
        confirmMfaEnrollment,
        verifySecondFactor,
        abandonSecondFactor,
        signOutEverywhere,
        changePassword,
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
