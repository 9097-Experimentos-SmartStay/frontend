// src/modules/staff/application/staff-activity.store.js

import { reactive } from "vue";
import { StaffActivityApi } from "../infrastructure/staff-activity.api.js";
import { StaffActivityAssembler } from "../infrastructure/staff-activity.assembler.js";
import { StaffActivity } from "../domain/model/staff-activity.entity.js";

const api = new StaffActivityApi();

export const staffActivityStore = reactive({
    activities: [],
    errors: [],

    async loadActivities() {
        try {
            const response = await api.getAllActivities();
            this.activities = StaffActivityAssembler.toEntitiesFromResponse(response.data);
        } catch (error) {
            this.errors.push(error);
        }
    },

    async addActivity({ staffName, roomNumber, action }) {
        try {
            const activity = new StaffActivity({
                staffName,
                roomNumber,
                action,
                timestamp: new Date().toISOString()
            });
            const response = await api.addActivity(activity);
            this.activities.unshift(StaffActivityAssembler.toEntityFromResource(response.data));
        } catch (error) {
            this.errors.push(error);
        }
    }
});
