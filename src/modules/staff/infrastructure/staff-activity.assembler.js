// src/modules/staff/infrastructure/staff-activity.assembler.js

import { StaffActivity } from "../domain/model/staff-activity.entity.js";

export class StaffActivityAssembler {
    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response)) return [];
        return response.map(resource => this.toEntityFromResource(resource));
    }

    static toEntityFromResource(resource) {
        return new StaffActivity({
            id: resource.id,
            staffName: resource.staffName,
            roomNumber: resource.roomNumber,
            action: resource.action,
            timestamp: resource.timestamp
        });
    }
}
