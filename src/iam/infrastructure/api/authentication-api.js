import { BaseApi } from '@/shared/infrastructure/services/base-api.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';

const basePath = endpoints.authentication;

/** Every /authentication/* endpoint is anonymous: never attach (or refresh) the access token. */
const anonymous = Object.freeze({ skipAuth: true });

/**
 * The MFA endpoints take the `mfaToken` of the sign-in as bearer, never the access token (§2.6).
 * `skipAuth` keeps the HTTP client from replacing the header or ending the session on their 401s
 * (a wrong code is not an expired session).
 * @param {string} mfaToken
 */
const withMfaToken = (mfaToken) => ({ skipAuth: true, headers: { Authorization: `Bearer ${mfaToken}` } });

/**
 * Anonymous account endpoints (EP-01: US-01, US-02, US-04), contract §2.
 * Each method returns the axios response; assemblers turn bodies into domain objects.
 */
export class AuthenticationApi extends BaseApi {
    /**
     * POST /authentication/sign-in → 200 sign-in body (§2.3).
     * @param {import('../../domain/commands/sign-in.command.js').SignInCommand} command
     */
    signIn(command) {
        return this.http.post(`${basePath}/sign-in`, {
            email: command.email,
            password: command.password,
            rememberMe: command.rememberMe,
        }, anonymous);
    }

    /**
     * POST /authentication/sign-up → 201 {id, email, emailVerified, message}. No role: always a guest.
     * @param {import('../../domain/commands/sign-up.command.js').SignUpCommand} command
     */
    signUp(command) {
        return this.http.post(`${basePath}/sign-up`, {
            firstName: command.firstName,
            lastName: command.lastName,
            email: command.email,
            password: command.password,
        }, anonymous);
    }

    /**
     * POST /authentication/refresh → 200 sign-in body with a NEW token and refresh token.
     * @param {string} refreshToken
     */
    refresh(refreshToken) {
        return this.http.post(`${basePath}/refresh`, { refreshToken }, anonymous);
    }

    /**
     * POST /authentication/sign-out → 204. Revokes the remembered session (idempotent).
     * @param {string} refreshToken
     */
    signOut(refreshToken) {
        return this.http.post(`${basePath}/sign-out`, { refreshToken }, anonymous);
    }

    /**
     * POST /authentication/sign-out-all → 204. Ends every session of the user (all devices), including this one.
     * Authenticated with the normal access token.
     */
    signOutEverywhere() {
        return this.http.post(`${basePath}/sign-out-all`);
    }

    /**
     * POST /authentication/mfa/enrollment → 200 {secret, otpAuthUri, issuer, accountName, digits, period, algorithm}.
     * Calling it again replaces the secret.
     * @param {string} mfaToken
     */
    startMfaEnrollment(mfaToken) {
        return this.http.post(`${basePath}/mfa/enrollment`, null, withMfaToken(mfaToken));
    }

    /**
     * POST /authentication/mfa/enrollment/confirm → 200 sign-in body with `token` and `recoveryCodes`.
     * @param {string} mfaToken
     * @param {string} code - 6 digits of the authenticator app.
     */
    confirmMfaEnrollment(mfaToken, code) {
        return this.http.post(`${basePath}/mfa/enrollment/confirm`, { code }, withMfaToken(mfaToken));
    }

    /**
     * POST /authentication/mfa/verify with exactly one of `code` or `recoveryCode` → 200 sign-in body with `token`.
     * @param {string} mfaToken
     * @param {{code?: string, recoveryCode?: string}} body
     */
    verifyMfa(mfaToken, body) {
        return this.http.post(`${basePath}/mfa/verify`, body, withMfaToken(mfaToken));
    }

    /**
     * POST /authentication/verify-email → 200 | 400 invalid/used | 410 expired.
     * @param {string} token
     */
    verifyEmail(token) {
        return this.http.post(`${basePath}/verify-email`, { token }, anonymous);
    }

    /**
     * POST /authentication/verify-email/resend → always 202.
     * @param {string} email
     */
    resendVerification(email) {
        return this.http.post(`${basePath}/verify-email/resend`, { email }, anonymous);
    }

    /**
     * POST /authentication/password-recovery → always 202 (same body whether the e-mail exists or not).
     * @param {string} email
     */
    requestPasswordRecovery(email) {
        return this.http.post(`${basePath}/password-recovery`, { email }, anonymous);
    }

    /**
     * POST /authentication/password-reset → 200 | 400 invalid/used | 410 expired.
     * @param {import('../../domain/commands/reset-password.command.js').ResetPasswordCommand} command
     */
    resetPassword(command) {
        return this.http.post(`${basePath}/password-reset`, {
            token: command.token,
            newPassword: command.newPassword,
        }, anonymous);
    }
}
