// src/modules/staff/domain/model/staff-activity.entity.js

export class StaffActivity {
    constructor({
                    id = '',
                    staffName = '',
                    roomNumber = '',
                    action = '',
                    timestamp = new Date().toISOString()
                }) {
        this.id = id;
        this.staffName = staffName;
        this.roomNumber = roomNumber;
        this.action = action;
        this.timestamp = timestamp;
    }
}
