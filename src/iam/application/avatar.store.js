import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import useIamStore from './iam.store.js';
import { AvatarApi } from '../infrastructure/api/avatar-api.js';
import { AvatarImageError, toAvatarBlob } from '../infrastructure/avatar-image-processor.js';
import { AvatarRuleError, validateAvatarFile } from '../domain/model/avatar-image.js';
import { OperationFailure } from '@/shared/application/operation-failure.js';
import { ProblemDetails } from '@/shared/infrastructure/http/problem-details.js';
import { reportError } from '@/shared/infrastructure/logging/report-error.js';

const avatarApi = new AvatarApi();

/** Problem codes of PUT /users/me/avatar → rule of the chosen picture. */
const RULE_BY_CODE = Object.freeze({
    'avatar.file_type': AvatarRuleError.TYPE,
    'avatar.too_large': AvatarRuleError.TOO_LARGE,
    'avatar.required': AvatarRuleError.UNREADABLE,
});

/**
 * Profile picture of the signed-in user, shown in the header and on the profile.
 *
 * The image is kept as an object URL of the blob the API returned (or of the one just uploaded), and released when
 * it is replaced or the session changes, so one account's picture never shows under another.
 */
export const useAvatarStore = defineStore('avatar', () => {
    const iamStore = useIamStore();

    /** @type {import('vue').Ref<string|null>} Object URL of the picture, null when the user has none. */
    const url = ref(null);
    const saving = ref(false);
    /** User whose picture was asked for, so the header and the profile do not ask twice. */
    let loadedFor = null;

    function show(blob) {
        if (url.value) URL.revokeObjectURL(url.value);
        url.value = blob ? URL.createObjectURL(blob) : null;
    }

    /** Reads the picture once per signed-in user. A user without one (404) simply has none. */
    async function load() {
        const userId = iamStore.currentUserId;
        if (!userId || loadedFor === userId) return;
        loadedFor = userId;
        try {
            const { data } = await avatarApi.getMine();
            if (iamStore.currentUserId === userId) show(data);
        } catch (err) {
            if (err?.response?.status !== 404) reportError('Error fetching the profile picture', err);
            show(null);
        }
    }

    /**
     * Checks the chosen file and turns it into the picture that would be uploaded (square, 320 px, JPEG, no EXIF).
     * @param {File} file
     * @returns {Promise<Blob>}
     * @throws {OperationFailure} reason typeNotAllowed | tooLarge | unreadable (params in `problem.params`)
     */
    async function prepare(file) {
        const rule = validateAvatarFile(file);
        if (rule) throw new OperationFailure(rule.code, new ProblemDetails({ status: null, params: rule.params ?? {} }));
        try {
            return await toAvatarBlob(file);
        } catch (err) {
            if (!(err instanceof AvatarImageError)) reportError('Error preparing a profile picture', err);
            throw new OperationFailure(AvatarRuleError.UNREADABLE, new ProblemDetails({ status: null }));
        }
    }

    /**
     * @param {Blob} image - From {@link prepare}.
     * @throws {OperationFailure} typeNotAllowed | tooLarge | unreadable | rateLimited | network...
     */
    async function change(image) {
        saving.value = true;
        try {
            await avatarApi.upload(image);
            show(image);
        } catch (err) {
            reportError('Error uploading the profile picture', err);
            throw OperationFailure.from(err, { classify: (problem) => RULE_BY_CODE[problem.violationOf('file')?.code] ?? null });
        } finally {
            saving.value = false;
        }
    }

    /** @throws {OperationFailure} network... */
    async function remove() {
        saving.value = true;
        try {
            await avatarApi.remove();
            show(null);
        } catch (err) {
            reportError('Error removing the profile picture', err);
            throw OperationFailure.from(err);
        } finally {
            saving.value = false;
        }
    }

    // Another account (or none): drop the picture; the header asks again for the new user.
    watch(() => iamStore.currentUserId, (userId) => {
        if (userId === loadedFor) return;
        loadedFor = null;
        show(null);
    });

    return { url, saving, load, prepare, change, remove };
});

export default useAvatarStore;
