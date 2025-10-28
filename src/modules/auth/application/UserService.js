// src/modules/auth/application/user_service.js

export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getUserList(filterRole = null) { // Permite filtrar por rol opcionalmente
        const users = await this.userRepository.getAllUsers();
        if (filterRole) {
            return users.filter(user => user.role === filterRole);
        }
        return users;
    }

    // Puedes añadir aquí otros métodos como getUserById, updateUser, deleteUser, etc.
}