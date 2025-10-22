import { User } from './user.js';
export class Guest extends User {
    constructor(id, name, email, password) {
        super(id, name, email, password, 'guest');
    }
}
