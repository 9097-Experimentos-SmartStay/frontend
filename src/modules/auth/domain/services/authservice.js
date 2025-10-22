export class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async register(user) {
        return await this.userRepository.createUser(user);
    }

    async login(email, password, role) {
        const user = await this.userRepository.findByEmail(email);
        if (!user || user.password !== password || user.role !== role) {
            throw new Error('Credenciales inválidas o rol incorrecto');
        }
        return user;
    }
}

