/**
 * Browser persistence for the authenticated session.
 *
 * This is the ONLY module that knows the localStorage keys of the session.
 * The rest of the app (stores, router guards, HTTP client) goes through it.
 * The saved UI language ('language') is not part of the session and is never cleared here.
 */
const KEYS = Object.freeze({
    token: 'token',
    legacyToken: 'user_token',
    userId: 'user_id',
    username: 'user_username',
    role: 'user_role',
});

function read(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

/** @returns {string|null} The JWT of the current session, if any. */
export function getToken() {
    return read(KEYS.token) || read(KEYS.legacyToken);
}

/** @returns {string|null} The normalized role saved at sign-in. */
export function getRole() {
    return read(KEYS.role);
}

/** @returns {number|null} The id of the signed-in user. */
export function getUserId() {
    const id = read(KEYS.userId);
    return id ? Number(id) : null;
}

/** @returns {string|null} The username of the signed-in user. */
export function getUsername() {
    return read(KEYS.username);
}

/** @returns {boolean} True when a token is stored. */
export function hasSession() {
    return !!getToken();
}

/**
 * Persists the session after a successful sign-in.
 * @param {{token: string, userId: number|string, username: string, role: string}} session
 */
export function saveSession({ token, userId, username, role }) {
    localStorage.setItem(KEYS.token, token);
    localStorage.setItem(KEYS.legacyToken, token);
    localStorage.setItem(KEYS.userId, String(userId));
    localStorage.setItem(KEYS.username, username ?? '');
    localStorage.setItem(KEYS.role, role);
}

/** Removes every session key (keeps unrelated preferences such as the language). */
export function clearSession() {
    Object.values(KEYS).forEach((key) => {
        try {
            localStorage.removeItem(key);
        } catch {
            /* storage unavailable: nothing to clear */
        }
    });
}
