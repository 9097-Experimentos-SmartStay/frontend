import { User } from './user.js';

export class Host extends User {
    constructor(id, name, email, password) {
        super(id, name, email, password, 'admin');
    }
}

