// src/bounded-contexts/accommodations/domain/types/room.types.js

/**
 * @typedef {Object} RoomResource
 * @property {number} id
 * @property {number} roomTypeId
 * @property {string} roomTypeName
 * @property {string} description
 * @property {string[]} amenities
 */

/**
 * @typedef {Object} CreateRoomResource
 * @property {number} roomTypeId
 * @property {string} description
 * @property {string[]} amenities
 */

export {};

