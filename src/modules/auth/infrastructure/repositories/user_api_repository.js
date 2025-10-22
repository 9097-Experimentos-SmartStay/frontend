import { IUserRepository } from "../../domain/repositories/i_user_repository.js";
import { authApi } from "../api/auth_api.js";

export class UserAPIRepository extends IUserRepository {
    async createUser(user) {
        return await authApi.register(user);
    }

    async findByEmail(email) {
        return await authApi.getUserByEmail(email);
    }
}



