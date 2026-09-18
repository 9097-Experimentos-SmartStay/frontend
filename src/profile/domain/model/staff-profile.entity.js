/**
 * Staff profile (StaffProfileResource, §12): job data of a staff member, linked to their account by `userId`.
 * Only admin and chain_admin can read /staff.
 */
export class StaffProfile {
    /**
     * @param {Object} params
     * @param {string} params.id
     * @param {number} params.userId
     * @param {string} params.code - "EMP-00001".
     * @param {string} params.fullName
     * @param {string} params.email
     * @param {string|null} params.phone
     * @param {string} params.position
     * @param {string} params.shift - Morning | Afternoon | Night | Rotating.
     * @param {string} params.status
     */
    constructor({ id, userId, code, fullName, email, phone, position, shift, status }) {
        this.id = id;
        this.userId = userId;
        this.code = code;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.position = position;
        this.shift = shift;
        this.status = status;
    }
}
