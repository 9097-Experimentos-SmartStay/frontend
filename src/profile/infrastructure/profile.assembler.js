import { Profile } from '../domain/model/profile.entity.js';
import { ProfileResource } from './profile.resource.js';

/**
 * Profile Assembler
 * Handles the transformation between Profile entities and ProfileResource DTOs
 */
export class ProfileAssembler {
    /**
     * Converts a ProfileResource to a Profile entity
     * @param {ProfileResource} resource - Profile resource from API
     * @returns {Profile} Profile entity
     */
    static toEntityFromResource(resource) {
        // Since the API returns fullName and fullAddress, we need to parse them
        // or make additional calls if needed. For now, we'll create a basic profile.
        const nameParts = resource.fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Parse address from fullAddress string
        // Format: "Street Number, City, PostalCode, Country"
        const addressParts = resource.streetAddress.split(', ');
        const streetAndNumber = addressParts[0]?.split(' ') || [];
        const street = streetAndNumber.slice(0, -1).join(' ') || '';
        const number = streetAndNumber[streetAndNumber.length - 1] || '';
        const city = addressParts[1] || '';
        const postalCode = addressParts[2] || '';
        const country = addressParts[3] || '';

        return new Profile(
            resource.id,
            firstName,
            lastName,
            resource.email,
            street,
            number,
            city,
            postalCode,
            country
        );
    }

    /**
     * Converts a Profile entity to a ProfileResource
     * @param {Profile} entity - Profile entity
     * @returns {ProfileResource} Profile resource
     */
    static toResourceFromEntity(entity) {
        return new ProfileResource(
            entity.id,
            entity.fullName,
            entity.email,
            entity.fullAddress
        );
    }

    /**
     * Converts an array of ProfileResources to Profile entities
     * @param {ProfileResource[]} resources - Array of profile resources
     * @returns {Profile[]} Array of profile entities
     */
    static toEntitiesFromResources(resources) {
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * Converts an array of Profile entities to ProfileResources
     * @param {Profile[]} entities - Array of profile entities
     * @returns {ProfileResource[]} Array of profile resources
     */
    static toResourcesFromEntities(entities) {
        return entities.map(entity => this.toResourceFromEntity(entity));
    }
}