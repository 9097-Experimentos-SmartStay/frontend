import { cloudinaryConfig } from '@/shared/infrastructure/config/api-config.js';

/**
 * Uploads an image to Cloudinary with an unsigned upload preset.
 *
 * Uses fetch (not the API http client) on purpose: Cloudinary is a third party and
 * must never receive the SmartStay Bearer token.
 *
 * @param {File} file - The image file.
 * @returns {Promise<string>} The public HTTPS URL of the uploaded image.
 * @throws {Error} When Cloudinary is not configured or the upload fails.
 */
export async function uploadImage(file) {
    const { cloudName, uploadPreset } = cloudinaryConfig;
    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary is not configured (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error(`Image upload failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data?.secure_url) {
        throw new Error('Invalid response from the image service');
    }
    return data.secure_url;
}
