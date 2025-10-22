export class Admin {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    // Ejemplo de regla de negocio
    canManageStaff() {
        return true;
    }

    canManageRooms() {
        return true;
    }
}
