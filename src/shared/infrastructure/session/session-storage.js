/**
 * Browser persistence of the authenticated session.
 *
 * This is the ONLY module that knows where the session lives. It stores a plain JSON snapshot
 * (tokens + the signed-in user); the IAM context turns it into its `Session` entity.
 *
 * Storage choice (US-02 scenario 4, contract §2.4):
 * - WITHOUT "Recordarme": `sessionStorage`. The session survives reloads of the tab but ends when
 *   the browser session ends, and no refresh token exists, so nothing outlives the 30-minute access token.
 * - WITH "Recordarme": `localStorage`, so the user stays signed in after closing and reopening the
 *   browser until they sign out (the refresh token slides for 30 days). The access token is kept next
 *   to the refresh token instead of only in memory: every open tab shares it (no refresh per tab or per
 *   reload, which with single-use rotating refresh tokens would race and trigger reuse detection),
 *   and memory-only storage would add little protection once a refresh token is readable by scripts anyway.
 *   The backend returns the tokens in the body (no httpOnly cookie), so web storage is the only option;
 *   XSS is mitigated by never rendering untrusted HTML (no v-html with API data).
 *
 * The saved UI language ('language') is not part of the session and is never cleared here.
 */
const SESSION_KEY = 'smartstay.session';

/** Keys written by previous versions of the app; removed on every clear. */
const LEGACY_KEYS = Object.freeze(['token', 'user_token', 'user_id', 'user_username', 'user_role']);

/**
 * @typedef {Object} StoredSession
 * @property {string} accessToken
 * @property {string|null} expiresAt - ISO 8601.
 * @property {string|null} refreshToken - Only with "Recordarme".
 * @property {string|null} refreshTokenExpiresAt
 * @property {Object} user - Plain snapshot of the signed-in user.
 */

function storage(kind) {
    try {
        return kind === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
        return null; // storage blocked (private mode, disabled cookies)
    }
}

function readFrom(kind) {
    try {
        const raw = storage(kind)?.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function removeFrom(kind, key) {
    try {
        storage(kind)?.removeItem(key);
    } catch {
        /* storage unavailable: nothing to clear */
    }
}

/**
 * @returns {StoredSession|null} The stored session (remembered one first), or null.
 */
export function loadSession() {
    return readFrom('local') ?? readFrom('session');
}

/**
 * Persists the session in the storage that matches its kind (see the module comment).
 * @param {StoredSession} session
 */
export function saveSession(session) {
    const remembered = !!session.refreshToken;
    clearSession();
    try {
        storage(remembered ? 'local' : 'session')?.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
        /* storage full or blocked: the session lives only in memory for this page */
    }
}

/** @returns {string|null} The current access token, if any. */
export function getAccessToken() {
    return loadSession()?.accessToken ?? null;
}

/** Removes the session from both storages (keeps unrelated preferences such as the language). */
export function clearSession() {
    for (const kind of ['local', 'session']) {
        removeFrom(kind, SESSION_KEY);
    }
    LEGACY_KEYS.forEach((key) => removeFrom('local', key));
}
