export class RegisterUseCase {
    constructor(authService) {
        this.authService = authService;
    }

    async execute(user) {
        return await this.authService.register(user);
    }
}

