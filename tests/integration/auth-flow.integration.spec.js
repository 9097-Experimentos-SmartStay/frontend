/**
 * Integration test: the web app's real API layer (AuthenticationApi + the shared axios client)
 * against a real SmartStay backend.
 *
 * It only runs against a local backend, never against production:
 *   cd backend && docker compose -p smartstay-int up -d --build        (API on :10000)
 *   VITE_SMARTSTAY_API_URL=http://127.0.0.1:10000/api/v1 \
 *   SMARTSTAY_API_CONTAINER=smartstay-int-api-1 npm run test:integration
 *
 * The token comes from `docker logs`: in Development the backend logs the verification link.
 */
import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { AuthenticationApi } from '@/iam/infrastructure/api/authentication-api.js';
import { SignUpCommand } from '@/iam/domain/commands/sign-up.command.js';
import { SignInCommand } from '@/iam/domain/commands/sign-in.command.js';
import { SessionAssembler } from '@/iam/infrastructure/assemblers/session.assembler.js';
import { httpClient } from '@/shared/infrastructure/http/http-client.js';

const apiUrl = import.meta.env.VITE_SMARTSTAY_API_URL ?? '';
const container = process.env.SMARTSTAY_API_CONTAINER ?? 'smartstay-api-1';
const isLocalBackend = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(apiUrl);

function lastVerificationToken() {
    const logs = execSync(`docker logs ${container} 2>&1`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const tokens = [...logs.matchAll(/verify-email\?token=([A-Za-z0-9_-]+)/g)];
    expect(tokens.length, `no verification link in the logs of ${container}`).toBeGreaterThan(0);
    return tokens.at(-1)[1];
}

const rejected = (promise) => promise.then(
    () => { throw new Error('the request was expected to be rejected'); },
    (error) => error.response,
);

describe.skipIf(!isLocalBackend)('guest account flow against the real backend', () => {
    const api = new AuthenticationApi();
    const email = `it.web.${Date.now()}@example.com`;
    const password = 'Sm4rt-Stay-Int-2026!';
    const account = { firstName: 'Ana', lastName: 'Perez', email, password };

    it('sign-up creates an unverified account', async () => {
        const response = await api.signUp(new SignUpCommand(account));
        expect(response.status).toBe(201);
        expect(response.data.email).toBe(email);
        expect(response.data.emailVerified).toBe(false);
    });

    it('sign-up with the same e-mail is rejected by the backend', async () => {
        const response = await rejected(api.signUp(new SignUpCommand(account)));
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
    });

    it('sign-in before verifying the e-mail is refused with auth.email_not_verified', async () => {
        const response = await rejected(api.signIn(new SignInCommand({ email, password })));
        expect(response.data.code).toBe('auth.email_not_verified');
    });

    it('sign-in with a wrong password is refused with 401', async () => {
        const response = await rejected(api.signIn(new SignInCommand({ email, password: 'Wrong-Pass-123!' })));
        expect(response.status).toBe(401);
    });

    it('a protected endpoint refuses a request without a session', async () => {
        const response = await rejected(httpClient.get('/bookings'));
        expect(response.status).toBe(401);
    });

    it('after verifying the e-mail the guest signs in and reads their bookings', async () => {
        const verified = await api.verifyEmail(lastVerificationToken());
        expect([200, 204]).toContain(verified.status);

        const signedIn = await api.signIn(new SignInCommand({ email, password }));
        expect(signedIn.status).toBe(200);
        const session = SessionAssembler.toEntityFromResponse(signedIn);
        expect(session.user.role).toBe('guest');
        expect(session.accessToken).toBeTruthy();

        const bookings = await httpClient.get('/bookings', {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        expect(bookings.status).toBe(200);
        expect(bookings.data).toEqual([]);
    });
});
