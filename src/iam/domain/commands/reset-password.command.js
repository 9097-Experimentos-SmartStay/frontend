/**
 * US-04: set a new password with the single-use token of the recovery e-mail.
 */
export class ResetPasswordCommand {
    /**
     * @param {Object} params
     * @param {string} params.token - The `token` query parameter of /reset-password.
     * @param {string} params.newPassword
     */
    constructor({ token, newPassword }) {
        this.token = token;
        this.newPassword = newPassword;
        Object.freeze(this);
    }
}
