import { User } from './user.js';
export class HotelStaff extends User {
    constructor(id, name, email, password) {
        super(id, name, email, password, 'staff');
    }
}

