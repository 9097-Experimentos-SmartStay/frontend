/**
 * Single source of truth for API configuration.
 *
 * Every value can be overridden at build time with a VITE_* variable
 * (see .env.example). The defaults match the backend routes, so a fresh
 * clone works with only VITE_SMARTSTAY_API_URL set.
 */
const env = import.meta.env;

/** Base URL of the SmartStay API. Relative ("/api/v1") in dev (Vite proxy), absolute in production. */
export const apiBaseUrl = env.VITE_SMARTSTAY_API_URL || '/api/v1';

/** Endpoint paths, relative to {@link apiBaseUrl}. */
export const endpoints = Object.freeze({
    signIn: env.VITE_SIGNIN_ENDPOINT_PATH || '/authentication/sign-in',
    signUp: env.VITE_SIGNUP_ENDPOINT_PATH || '/authentication/sign-up',
    users: env.VITE_USERS_ENDPOINT_PATH || '/users',
    profiles: env.VITE_PROFILES_ENDPOINT_PATH || '/profiles',
    hotels: env.VITE_HOTELS_ENDPOINT_PATH || '/hotels',
    rooms: env.VITE_ROOMS_ENDPOINT_PATH || '/rooms',
    roomTypes: env.VITE_ROOM_TYPES_ENDPOINT_PATH || '/room-types',
    accommodationOptions: '/accommodations/options',
    bookings: env.VITE_BOOKINGS_ENDPOINT_PATH || '/bookings',
    payments: env.VITE_PAYMENTS_ENDPOINT_PATH || '/payments',
    analytics: env.VITE_ANALYTICS_ENDPOINT_PATH || '/analytics',
});

/** Cloudinary unsigned upload settings (hotel images). */
export const cloudinaryConfig = Object.freeze({
    cloudName: env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
});
