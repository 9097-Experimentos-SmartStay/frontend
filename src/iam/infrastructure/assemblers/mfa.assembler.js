import { MfaChallenge, MfaChallengeKind } from '../../domain/model/mfa-challenge.js';
import { RecoveryCodes, TotpEnrollment } from '../../domain/model/totp-enrollment.js';
import { VerifySecondFactorCommand } from '../../domain/commands/verify-second-factor.command.js';

/**
 * Second-factor bodies of §2.3 / §2.6 ↔ domain objects.
 */
export class MfaAssembler {
    /**
     * A sign-in body with `token: null` and one of the MFA flags.
     * @param {Object} body - Sign-in response body.
     * @param {{email: string, rememberMe: boolean}} signIn - What the password step sent.
     * @returns {MfaChallenge|null} Null when the body carries no second-factor request.
     */
    static toChallengeFromSignIn(body, signIn) {
        if (!body || body.token || !body.mfaToken) return null;
        const kind = body.mfaEnrollmentRequired
            ? MfaChallengeKind.ENROLLMENT
            : body.mfaRequired ? MfaChallengeKind.VERIFICATION : null;
        if (!kind) return null;
        return new MfaChallenge({
            kind,
            token: body.mfaToken,
            expiresAt: body.mfaTokenExpiresAt ? new Date(body.mfaTokenExpiresAt) : null,
            email: body.email ?? signIn.email,
            rememberMe: signIn.rememberMe,
        });
    }

    /**
     * @param {Object} response - Axios response of POST /authentication/mfa/enrollment.
     * @returns {TotpEnrollment}
     */
    static toEnrollmentFromResponse(response) {
        const body = response?.data ?? {};
        return new TotpEnrollment({
            secret: body.secret ?? '',
            otpAuthUri: body.otpAuthUri ?? '',
            issuer: body.issuer ?? '',
            accountName: body.accountName ?? '',
            digits: Number(body.digits ?? 6),
            period: Number(body.period ?? 30),
        });
    }

    /**
     * @param {Object} response - Axios response of POST /authentication/mfa/enrollment/confirm.
     * @returns {RecoveryCodes}
     */
    static toRecoveryCodesFromResponse(response) {
        return new RecoveryCodes(Array.isArray(response?.data?.recoveryCodes) ? response.data.recoveryCodes : []);
    }

    /**
     * Body of POST /authentication/mfa/verify: exactly one of the two fields.
     * @param {VerifySecondFactorCommand} command
     * @returns {{code?: string, recoveryCode?: string}}
     */
    static toVerifyResource(command) {
        return command.usesRecoveryCode ? { recoveryCode: command.value } : { code: command.value };
    }
}
