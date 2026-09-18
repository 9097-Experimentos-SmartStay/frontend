/**
 * A signed-in user changes their own password (POST /users/change-password, §3). The new password follows the
 * policy of the user's role (§2.0); every other session of the account stops working.
 */
export class ChangePasswordCommand {
    /**
     * @param {Object} params
     * @param {string} params.currentPassword
     * @param {string} params.newPassword
     */
    constructor({ currentPassword, newPassword }) {
        this.currentPassword = currentPassword ?? '';
        this.newPassword = newPassword ?? '';
        Object.freeze(this);
    }
}
