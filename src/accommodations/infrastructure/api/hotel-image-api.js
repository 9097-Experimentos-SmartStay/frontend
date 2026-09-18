import { BaseApi } from '@/shared/infrastructure/services/base-api.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';

/**
 * @typedef {Object} UploadSignature
 * @property {string} cloudName
 * @property {string} apiKey
 * @property {number} timestamp
 * @property {string} signature
 * @property {string} uploadPreset
 * @property {string} folder
 * @property {string} [uploadUrl]
 */

/** Cloudinary rejected the upload (expired signature, format of the preset, service down...). */
export class ImageHostingError extends Error {
    /** @param {number|null} status - HTTP status of Cloudinary (null when no response arrived). */
    constructor(status) {
        super(`Image upload failed${status ? ` with HTTP ${status}` : ''}`);
        this.name = 'ImageHostingError';
        this.status = status;
    }
}

/**
 * Signed uploads of hotel images (§ media).
 *
 * 1. The API signs the upload (`POST /media/hotel-images/signature`, admin/chain_admin): the Cloudinary API secret
 *    never reaches the browser, and the signature is short-lived and bound to the hotels preset and folder.
 * 2. The browser sends the file straight to Cloudinary with that signature. It uses fetch, not the API http
 *    client, on purpose: Cloudinary is a third party and must never receive the SmartStay Bearer token.
 */
export class HotelImageApi extends BaseApi {
    /**
     * @returns {Promise<UploadSignature>}
     * @throws {unknown} Axios error: 503 `media.uploads_not_configured`, 403, 429...
     */
    async requestUploadSignature() {
        const { data } = await this.http.post(`${endpoints.media}/hotel-images/signature`);
        return data;
    }

    /**
     * @param {File} file
     * @param {UploadSignature} signature - Sent exactly as signed.
     * @returns {Promise<string>} The HTTPS delivery URL (`secure_url`).
     * @throws {ImageHostingError}
     */
    async upload(file, signature) {
        const body = new FormData();
        body.append('file', file);
        body.append('api_key', signature.apiKey);
        body.append('timestamp', String(signature.timestamp));
        body.append('signature', signature.signature);
        body.append('upload_preset', signature.uploadPreset);
        body.append('folder', signature.folder);

        const url = signature.uploadUrl || `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`;
        let response;
        try {
            response = await fetch(url, { method: 'POST', body });
        } catch {
            throw new ImageHostingError(null);
        }
        if (!response.ok) throw new ImageHostingError(response.status);

        const data = await response.json().catch(() => null);
        if (!data?.secure_url) throw new ImageHostingError(response.status);
        return data.secure_url;
    }
}
