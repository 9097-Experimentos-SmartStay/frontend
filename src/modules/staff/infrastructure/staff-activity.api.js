// src/modules/staff/infrastructure/staff-activity.api.js

export class StaffActivityApi {
    constructor() {
        this.activities = []; // simulación local
    }

    async getAllActivities() {
        return Promise.resolve({ data: this.activities });
    }

    async addActivity(activity) {
        const newActivity = { ...activity, id: crypto.randomUUID() };
        this.activities.push(newActivity);
        return Promise.resolve({ data: newActivity });
    }
}
