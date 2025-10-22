export class LoginUseCase {
    constructor(authService) {
        this.authService = authService;
    }

    async execute(email, password, role) {
        return await this.authService.login(email, password, role);
    }
}

