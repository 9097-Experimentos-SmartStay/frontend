import { AVATAR_SIZE_PX } from '../domain/model/avatar-image.js';

/** The picture could not be decoded (corrupt file, or a format the browser cannot read). */
export class AvatarImageError extends Error {
    constructor() {
        super('The picture could not be read');
        this.name = 'AvatarImageError';
    }
}

/**
 * Crops the centre square of a picture and draws it at {@link AVATAR_SIZE_PX} as a JPEG.
 *
 * Re-encoding through a canvas also drops the EXIF metadata of the original (GPS position, camera, date), so a
 * phone photo never leaves the device with the place it was taken. `createImageBitmap` applies the EXIF
 * orientation, so portrait photos are not uploaded sideways.
 * @param {File} file - Already validated (validateAvatarFile).
 * @returns {Promise<Blob>} image/jpeg, typically 20–40 KB.
 * @throws {AvatarImageError}
 */
export async function toAvatarBlob(file) {
    let bitmap;
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
        throw new AvatarImageError();
    }

    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_SIZE_PX;
    canvas.height = AVATAR_SIZE_PX;
    const context = canvas.getContext('2d');
    // White under transparent PNG/WebP pixels: JPEG has no alpha and would turn them black.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, sx, sy, side, side, 0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
    if (!blob) throw new AvatarImageError();
    return blob;
}
