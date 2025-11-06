// src/modules/auth/infrastructure/repositories/user_api_repository.js
import { IUserRepository } from "../../domain/repositories/i_user_repository.js";
import { authApi } from "../api/auth_api.js";

export class UserAPIRepository extends IUserRepository {
    async createUser(user) {
        return await authApi.register(user);
    }

    async findByEmail(email) {
        return await authApi.getUserByEmail(email);
    }

    async getAllUsers() {
        // Opcionalmente, podrías filtrar aquí por rol si la API no lo hace
        // por ejemplo: return (await authApi.fetchAllUsers()).filter(u => u.role === 'staff');
        return await authApi.fetchAllUsers();
    }

    async deleteUser(userId) {
        await authApi.removeUser(userId);
    }

    async getUserById(userId) {
        return await authApi.fetchUserById(userId);
    }

    async updateUser(userId, userData) {
        return await authApi.patchUser(userId, userData);
    }
}