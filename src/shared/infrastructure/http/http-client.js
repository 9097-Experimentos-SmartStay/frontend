import axios from 'axios';
import { apiBaseUrl } from '@/shared/infrastructure/config/api-config.js';
import { getAccessToken, loadSession } from '@/shared/infrastructure/session/session-storage.js';
import { ProblemDetails } from '@/shared/infrastructure/http/problem-details.js';

/**
 * The one axios instance used to talk to the SmartStay API.
 *
 * - Adds `Authorization: Bearer <access token>` when a session exists (skipped with `skipAuth: true`,
 *   used by the anonymous /authentication/* calls).
 * - Remembered sessions ("Recordarme") are renewed silently: shortly before `expiresAt`, and once more
 *   when a request gets 401 `auth.token_expired`. Refreshes are SERIALIZED: concurrent requests wait for the same
 *   refresh and are retried with the new token, because a refresh token is single use and presenting it
 *   twice revokes the whole session (§2.4).
 * - Any other 401 on an authenticated request ends the session through the handler registered with
 *   {@link configureSessionHandling} (the app clears the IAM state and goes to /login with the reason). A
 *   401 `auth.session_revoked` says why in `reason` (role or hotel changed, password changed, signed out
 *   everywhere, MFA reset, deactivated). A request sent with `checksCredentials: true` (change password) gets
 *   its `auth.invalid_credentials` 401 back as a normal error: it means "wrong current password".
 *
 * This module does not import the IAM context: IAM registers how to refresh and what to do when
 * the session ends, keeping the dependency direction shared ← iam.
 */
export const httpClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

/** Refresh this long before `expiresAt`, so a request never leaves with a token about to expire. */
const REFRESH_MARGIN_MS = 60 * 1000;

/** Why the API rejected the session; the login page shows a message for each. */
export const SessionEndReason = Object.freeze({
    EXPIRED: 'session-expired',
    REVOKED: 'session-revoked',
    PERMISSIONS_CHANGED: 'permissions-changed',
    PASSWORD_CHANGED: 'password-changed',
    SIGNED_OUT_EVERYWHERE: 'signed-out-everywhere',
    MFA_RESET: 'mfa-reset',
    DEACTIVATED: 'account-deactivated',
});

/** Codes of the 401s the session lifecycle reacts to (§0.1). */
const ApiCode = Object.freeze({
    TOKEN_EXPIRED: 'auth.token_expired',
    SESSION_REVOKED: 'auth.session_revoked',
    INVALID_CREDENTIALS: 'auth.invalid_credentials',
});

/** `reason` of a 401 `auth.session_revoked` → message of the login page. */
const END_REASON_BY_REVOCATION = Object.freeze({
    role_changed: SessionEndReason.PERMISSIONS_CHANGED,
    assignment_changed: SessionEndReason.PERMISSIONS_CHANGED,
    password_changed: SessionEndReason.PASSWORD_CHANGED,
    password_reset: SessionEndReason.PASSWORD_CHANGED,
    signed_out_everywhere: SessionEndReason.SIGNED_OUT_EVERYWHERE,
    mfa_reset: SessionEndReason.MFA_RESET,
    deactivated: SessionEndReason.DEACTIVATED,
});

const handlers = {
    /** @type {null | (() => Promise<string>)} Renews the session and returns the new access token. */
    refreshSession: null,
    /** @type {null | ((reason: string) => void)} */
    onSessionEnded: null,
};

/**
 * Wires the session lifecycle (done once in main.js).
 * @param {Object} params
 * @param {() => Promise<string>} params.refreshSession - Throws when the session cannot be renewed.
 * @param {(reason: string) => void} params.onSessionEnded
 */
export function configureSessionHandling({ refreshSession, onSessionEnded }) {
    handlers.refreshSession = refreshSession;
    handlers.onSessionEnded = onSessionEnded;
}

let refreshInFlight = null;

/**
 * Starts a refresh, or joins the one already running.
 * @returns {Promise<string>} The new access token.
 */
function refreshOnce() {
    if (!handlers.refreshSession) return Promise.reject(new Error('Session refresh is not configured'));
    if (!refreshInFlight) {
        refreshInFlight = handlers.refreshSession().finally(() => {
            refreshInFlight = null;
        });
    }
    return refreshInFlight;
}

function isRemembered(session) {
    return !!session?.refreshToken;
}

function expiresSoon(session) {
    if (!session?.expiresAt) return false;
    return new Date(session.expiresAt).getTime() - REFRESH_MARGIN_MS <= Date.now();
}

/**
 * @param {ProblemDetails} problem - A 401 of an authenticated request (or of the refresh).
 * @returns {string} One of {@link SessionEndReason}.
 */
function endReasonFor(problem) {
    if (problem.is(ApiCode.SESSION_REVOKED)) {
        return END_REASON_BY_REVOCATION[problem.extensions.reason] ?? SessionEndReason.REVOKED;
    }
    return SessionEndReason.EXPIRED;
}

httpClient.interceptors.request.use(async (config) => {
    if (config.skipAuth) return config;

    let session = loadSession();
    if (isRemembered(session) && expiresSoon(session)) {
        try {
            await refreshOnce();
            session = loadSession();
        } catch {
            // The request goes out with the old token; its 401 ends the session below.
        }
    }
    if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
});

httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        const sentToken = config?.headers?.Authorization?.replace(/^Bearer /, '');

        // Only an authenticated request means "your session is no longer valid".
        // A 401 on sign-in (no token) is wrong credentials and is handled by the form.
        if (error.response?.status !== 401 || !sentToken || config.skipAuth) {
            return Promise.reject(error);
        }

        const problem = ProblemDetails.fromError(error);
        const session = loadSession();

        if (config.checksCredentials && problem.is(ApiCode.INVALID_CREDENTIALS)) {
            return Promise.reject(error);
        }

        if (!config._authRetried && problem.is(ApiCode.TOKEN_EXPIRED) && isRemembered(session)) {
            config._authRetried = true;
            try {
                // Another tab may already have refreshed: reuse its token instead of spending the refresh token.
                const current = getAccessToken();
                const token = current && current !== sentToken ? current : await refreshOnce();
                config.headers.Authorization = `Bearer ${token}`;
                return httpClient(config);
            } catch (refreshError) {
                // The refresh says why the remembered session ended (e.g. a role change), or it simply expired.
                handlers.onSessionEnded?.(endReasonFor(ProblemDetails.fromError(refreshError)));
                return Promise.reject(error);
            }
        }

        handlers.onSessionEnded?.(endReasonFor(problem));
        return Promise.reject(error);
    }
);
