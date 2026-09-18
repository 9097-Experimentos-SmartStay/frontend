/**
 * Room Resource Definition.
 * Represents the raw data structure coming from the API.
 * Matches the Backend's RoomResource.cs
 *
 * @typedef {Object} RoomResource
 * @property {number} id - Unique identifier.
 * @property {number} hotelId - The ID of the hotel this room belongs to.
 * @property {number} roomTypeId - The ID of the room type.
 * @property {string} roomTypeName - The display name of the room type.
 * @property {number} price - The price per night.
 * @property {string} description - Description of the room.
 * @property {string[]} amenities - List of amenities (e.g., "Wifi", "TV").
 * @property {string} status - Available | Occupied | Cleaning | Maintenance (US-29).
 */

export {}; // Exportamos vacío para que sea un módulo válido