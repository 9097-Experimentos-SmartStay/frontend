import { Session } from '../../domain/model/session.entity.js';
import { UserAssembler } from './user.assembler.js';

const toDate = (value) => (value ? new Date(value) : null);
const toIso = (date) => (date ? date.toISOString() : null);

/**
 * Sign-in / refresh body (§2.3) ↔ {@link Session} ↔ stored snapshot (session-storage.js).
 */
export class SessionAssembler {
    /**
     * @param {Object} response - Axios response of sign-in or refresh (200).
     * @returns {Session}
     * @throws {Error} When the body carries no token.
     */
    static toEntityFromResponse(response) {
        const body = response?.data;
        if (!body?.token) {
            throw new Error('Authentication response has no token');
        }
        return new Session({
            user: UserAssembler.toEntityFromResource(body),
            accessToken: body.token,
            expiresAt: toDate(body.expiresAt),
            refreshToken: body.refreshToken ?? null,
            refreshTokenExpiresAt: toDate(body.refreshTokenExpiresAt),
        });
    }

    /**
     * @param {Session} session
     * @returns {import('@/shared/infrastructure/session/session-storage.js').StoredSession}
     */
    static toStored(session) {
        return {
            accessToken: session.accessToken,
            expiresAt: toIso(session.expiresAt),
            refreshToken: session.refreshToken,
            refreshTokenExpiresAt: toIso(session.refreshTokenExpiresAt),
            user: UserAssembler.toSnapshot(session.user),
        };
    }

    /**
     * @param {import('@/shared/infrastructure/session/session-storage.js').StoredSession|null} stored
     * @returns {Session|null} Null when nothing usable is stored.
     */
    static fromStored(stored) {
        if (!stored?.accessToken || !stored.user) return null;
        const user = UserAssembler.fromSnapshot(stored.user);
        if (!user?.role) return null; // unknown role (e.g. a pre-EP-01 'staff' snapshot): force a new sign-in
        return new Session({
            user,
            accessToken: stored.accessToken,
            expiresAt: toDate(stored.expiresAt),
            refreshToken: stored.refreshToken ?? null,
            refreshTokenExpiresAt: toDate(stored.refreshTokenExpiresAt),
        });
    }
}
