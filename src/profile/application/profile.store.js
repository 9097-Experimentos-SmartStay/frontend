import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ProfileApi } from '../infrastructure/api/profile-api.js';
import { ProfileAssembler } from '../infrastructure/profile.assembler.js';
import { Capability, UserRole, can } from '@/iam/domain/user-role.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const profileApi = new ProfileApi();

/**
 * Profiles of the signed-in user and the guest directory of the staff area.
 * A 404 on a "by user" read means "no profile yet", not an error.
 */
export const useProfileStore = defineStore('profile', () => {
    /** @type {import('vue').Ref<import('../domain/model/guest-profile.entity.js').GuestProfile|null>} */
    const guestProfile = ref(null);
    /** @type {import('vue').Ref<import('../domain/model/staff-profile.entity.js').StaffProfile|null>} */
    const staffProfile = ref(null);
    /** @type {import('vue').Ref<Array<import('../domain/model/guest-profile.entity.js').GuestProfile>>} */
    const guests = ref([]);
    const loading = ref(false);
    const error = ref(null);

    async function readOrNull(request, assemble) {
        try {
            return assemble((await request()).data);
        } catch (err) {
            if (err?.response?.status === 404) return null;
            throw err;
        }
    }

    /**
     * Loads the profile of the signed-in user: the guest profile for a guest, the staff profile for
     * admin/chain_admin (the only roles allowed to read /staff). Other staff roles have none to read.
     * @param {import('@/iam/domain/model/user.entity.js').User} user
     * @returns {Promise<void>}
     */
    async function fetchMyProfile(user) {
        loading.value = true;
        error.value = null;
        guestProfile.value = null;
        staffProfile.value = null;
        try {
            if (user.role === UserRole.GUEST) {
                guestProfile.value = await readOrNull(() => profileApi.getGuestProfileByUserId(user.id), ProfileAssembler.toGuestProfile);
            } else if (can(user.role, Capability.MANAGE_USERS)) {
                staffProfile.value = await readOrNull(() => profileApi.getStaffProfileByUserId(user.id), ProfileAssembler.toStaffProfile);
            }
        } catch (err) {
            reportError('Error fetching profile', err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * POST /guests for the signed-in guest.
     * @param {import('../domain/commands/create-guest-profile.command.js').CreateGuestProfileCommand} command - Already validated.
     * @returns {Promise<import('../domain/model/guest-profile.entity.js').GuestProfile>}
     * @throws The HTTP error (409 duplicate e-mail/document/user, 400 invalid value).
     */
    async function createMyGuestProfile(command) {
        loading.value = true;
        try {
            const response = await profileApi.createGuestProfile(ProfileAssembler.toCreateGuestResource(command));
            guestProfile.value = ProfileAssembler.toGuestProfile(response.data);
            return guestProfile.value;
        } catch (err) {
            reportError('Error creating guest profile', err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /** GET /guests (reception, admin, chain_admin). */
    async function fetchGuests() {
        loading.value = true;
        error.value = null;
        try {
            guests.value = ProfileAssembler.toGuestProfiles(await profileApi.getGuestProfiles());
        } catch (err) {
            reportError('Error fetching guests', err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    return { guestProfile, staffProfile, guests, loading, error, fetchMyProfile, createMyGuestProfile, fetchGuests };
});
