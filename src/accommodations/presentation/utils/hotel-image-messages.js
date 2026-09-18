import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/** Business reason of a failed hotel image upload → i18n key. */
const KEYS = Object.freeze({
    imageTypeNotAllowed: 'staffHotels.upload.imageTypeNotAllowed',
    imageTooLarge: 'staffHotels.upload.imageTooLarge',
    imageUploadsNotConfigured: 'staffHotels.upload.notConfigured',
    imageUploadRejected: 'staffHotels.upload.rejected',
    rateLimited: 'staffHotels.upload.rateLimited',
    forbidden: 'staffHotels.upload.forbidden',
});

/**
 * Localized message of a failed hotel image upload.
 * @param {Function} t
 * @param {import('@/shared/application/operation-failure.js').OperationFailure} failure
 * @returns {string}
 */
export function hotelImageUploadMessage(t, failure) {
    return t(failureMessageKey(failure, KEYS), { maxMb: 10, ...(failure?.problem?.params ?? {}) });
}
