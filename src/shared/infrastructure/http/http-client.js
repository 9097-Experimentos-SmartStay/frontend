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
 *   when a request gets 401 "expired". Refreshes are SERIALIZED: concurrent requests wait for the same
 *   refresh and are retried with the new token, because a refresh token is single use and presenting it
 *   twice revokes the whole session (§2.4).
 * - Any other 401 on an authenticated request ends the session through the handler registered with
 *   {@link configureSessionHandling} (the app clears the IAM state and goes to /login). A request sent with
 *   `checksCredentials: true` (change password) gets its "Invalid credentials" 401 back as a normal error:
 *   it means "wrong current password", not "your session ended".
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
    DEACTIVATED: 'account-deactivated',
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

function endReasonFor(problem) {
    if (problem.detailIncludes('deactivated')) return SessionEndReason.DEACTIVATED;
    if (problem.detailIncludes('revoked')) return SessionEndReason.REVOKED;
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

        if (config.checksCredentials && problem.detail === 'Invalid credentials') {
            return Promise.reject(error);
        }

        if (!config._authRetried && problem.detailIncludes('expired') && isRemembered(session)) {
            config._authRetried = true;
            try {
                // Another tab may already have refreshed: reuse its token instead of spending the refresh token.
                const current = getAccessToken();
                const token = current && current !== sentToken ? current : await refreshOnce();
                config.headers.Authorization = `Bearer ${token}`;
                return httpClient(config);
            } catch {
                handlers.onSessionEnded?.(SessionEndReason.EXPIRED);
                return Promise.reject(error);
            }
        }

        handlers.onSessionEnded?.(endReasonFor(problem));
        return Promise.reject(error);
    }
);
