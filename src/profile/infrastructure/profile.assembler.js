import { GuestProfile } from '../domain/model/guest-profile.entity.js';
import { StaffProfile } from '../domain/model/staff-profile.entity.js';

/**
 * GuestProfileResource (§11) / StaffProfileResource (§12) ↔ entities.
 */
export class ProfileAssembler {
    /**
     * @param {Object} resource
     * @returns {GuestProfile|null}
     */
    static toGuestProfile(resource) {
        if (!resource) return null;
        return new GuestProfile({
            id: resource.id,
            userId: resource.userId ?? null,
            firstName: resource.firstName ?? '',
            lastName: resource.lastName ?? '',
            email: resource.email ?? null,
            phone: resource.phone ?? null,
            documentType: resource.documentType ?? null,
            documentNumber: resource.documentNumber ?? null,
            street: resource.street ?? null,
            number: resource.number ?? null,
            city: resource.city ?? null,
            postalCode: resource.postalCode ?? null,
            country: resource.country ?? null,
            status: resource.status,
        });
    }

    /**
     * @param {Object} response - Axios response with GuestProfileResource[].
     * @returns {GuestProfile[]}
     */
    static toGuestProfiles(response) {
        return Array.isArray(response?.data) ? response.data.map(ProfileAssembler.toGuestProfile) : [];
    }

    /**
     * @param {Object} resource
     * @returns {StaffProfile|null}
     */
    static toStaffProfile(resource) {
        if (!resource) return null;
        return new StaffProfile({
            id: resource.id,
            userId: resource.userId,
            code: resource.code,
            fullName: resource.fullName ?? [resource.firstName, resource.lastName].filter(Boolean).join(' '),
            email: resource.email,
            phone: resource.phone ?? null,
            position: resource.position,
            shift: resource.shift,
            status: resource.status,
        });
    }

    /**
     * Body of POST /guests. Optional parts are omitted when empty (the address is all-or-nothing).
     * @param {import('../domain/commands/create-guest-profile.command.js').CreateGuestProfileCommand} command
     * @returns {Object}
     */
    static toCreateGuestResource(command) {
        const resource = { firstName: command.firstName, lastName: command.lastName, phone: command.phone };
        if (command.email) resource.email = command.email;
        if (command.documentType != null && command.documentNumber) {
            resource.documentType = command.documentType;
            resource.documentNumber = command.documentNumber;
        }
        if (command.hasAddress) {
            Object.assign(resource, {
                street: command.street,
                number: command.number,
                city: command.city,
                country: command.country,
            });
            if (command.postalCode) resource.postalCode = command.postalCode;
        }
        return resource;
    }
}
