import { BaseApi } from '@/shared/infrastructure/services/base-api.js';
import { endpoints } from '@/shared/infrastructure/config/api-config.js';

const avatarPath = `${endpoints.users}/me/avatar`;

/**
 * Profile picture of the signed-in user (any role). The API serves the image itself behind the Bearer token, so it
 * is read as a blob through the HTTP client instead of a plain `<img src>`.
 */
export class AvatarApi extends BaseApi {
    /** GET /users/me/avatar → 200 the image (blob) | 404 when the user has none. */
    getMine() {
        return this.http.get(avatarPath, { responseType: 'blob' });
    }

    /**
     * PUT /users/me/avatar (multipart field `file`) → 204. 400 `avatar.*` on `file`, 429 rate limited.
     * @param {Blob} image
     */
    upload(image) {
        const body = new FormData();
        body.append('file', image, 'avatar.jpg');
        // The client defaults to JSON, which would serialize the FormData: multipart lets the browser set the boundary.
        return this.http.put(avatarPath, body, { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    /** DELETE /users/me/avatar → 204 (also when there was none). */
    remove() {
        return this.http.delete(avatarPath);
    }
}
