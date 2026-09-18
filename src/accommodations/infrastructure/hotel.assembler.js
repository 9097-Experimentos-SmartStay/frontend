import { Hotel } from '../domain/model/hotel.entity.js';
import { HotelLocation } from '../domain/model/hotel-location.js';

/**
 * HotelResource (§4) ↔ {@link Hotel}.
 * @class
 */
export class HotelAssembler {
    /**
     * @param {Object} resource
     * @returns {Hotel|null}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new Hotel({
            id: resource.id,
            hostId: resource.hostId ?? null,
            name: resource.name,
            description: resource.description,
            location: HotelLocation.parse(resource.location),
            type: resource.type,
            photoUrl: resource.imageUrl,
            basePrice: resource.basePrice,
            amenities: resource.amenities,
            rating: resource.rating ?? null,
        });
    }

    /**
     * @param {Object} response - Axios response.
     * @returns {Hotel[]}
     */
    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response?.data)) return [];
        return response.data.map(HotelAssembler.toEntityFromResource);
    }

    /**
     * @param {Object} response - Axios response.
     * @returns {Hotel|null}
     */
    static toEntityFromResponse(response) {
        return HotelAssembler.toEntityFromResource(response?.data);
    }

    /**
     * Response of POST /hotels: `{ hotel, session }`. `session` holds the new tokens of an admin who registered
     * their own hotel (the token must carry it); it is null for a chain_admin.
     * @param {Object} response - Axios response.
     * @returns {{hotel: Hotel|null, session: Object|null}}
     */
    static toRegistrationFromResponse(response) {
        const body = response?.data ?? {};
        return { hotel: HotelAssembler.toEntityFromResource(body.hotel), session: body.session ?? null };
    }

    /**
     * Body of POST /hotels and PUT /hotels/{id} (every string is required).
     * `hostId` is never sent: an admin always hosts their own hotel, and for a chain_admin
     * the backend defaults to the caller.
     * @param {Object} form
     * @param {string} form.name
     * @param {string} form.address
     * @param {string} form.city
     * @param {string} form.country
     * @param {string} form.description
     * @param {string} form.imageUrl
     * @param {string} form.type
     * @param {string[]} form.amenities
     * @returns {Object}
     */
    static toSaveResource(form) {
        return {
            name: form.name.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            description: form.description.trim(),
            imageUrl: form.imageUrl.trim(),
            type: form.type,
            amenities: [...form.amenities],
        };
    }
}
