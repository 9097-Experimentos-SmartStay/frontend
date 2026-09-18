/**
 * The authenticated session of the current browser (§2.3 / §2.4).
 *
 * - `accessToken` is a 30-minute JWT (`expiresAt`).
 * - `refreshToken` only exists when the user checked "Recordarme" (`remembered`); it is single use
 *   and rotated on every refresh.
 */
export class Session {
    /**
     * @param {Object} params
     * @param {import('./user.entity.js').User} params.user
     * @param {string} params.accessToken
     * @param {Date|null} params.expiresAt
     * @param {string|null} [params.refreshToken]
     * @param {Date|null} [params.refreshTokenExpiresAt]
     */
    constructor({ user, accessToken, expiresAt, refreshToken = null, refreshTokenExpiresAt = null }) {
        this.user = user;
        this.accessToken = accessToken;
        this.expiresAt = expiresAt;
        this.refreshToken = refreshToken;
        this.refreshTokenExpiresAt = refreshTokenExpiresAt;
        Object.freeze(this);
    }

    /** @returns {boolean} True when the session can be renewed silently ("Recordarme"). */
    get remembered() {
        return !!this.refreshToken;
    }

    /**
     * @param {number} [marginMs] - Consider the token expired this long before `expiresAt`.
     * @param {Date} [now]
     * @returns {boolean}
     */
    isAccessTokenExpired(marginMs = 0, now = new Date()) {
        if (!this.expiresAt) return false;
        return this.expiresAt.getTime() - marginMs <= now.getTime();
    }

    /**
     * @param {import('./user.entity.js').User} user
     * @returns {Session} The same tokens for an updated user (e.g. after an admin registers their hotel).
     */
    withUser(user) {
        return new Session({ ...this, user });
    }
}
