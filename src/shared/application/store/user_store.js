// src/shared/application/store/user_store.js
import { defineStore } from 'pinia';
// BORRA CUALQUIER IMPORT DE 'useRouter' DE AQUÍ

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('user_token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        role: localStorage.getItem('user_role') || null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        isStaff: (state) => state.role === 'staff',
        isGuest: (state) => state.role === 'guest',
    },

    actions: {
        // Esta acción guarda el estado al loguearse
        loginSuccess(userData) {
            this.token = userData.id; // O un token real si lo tuvieras
            this.role = userData.role;
            this.user = userData;

            localStorage.setItem('user_token', this.token);
            localStorage.setItem('user_role', this.role);
            localStorage.setItem('user', JSON.stringify(this.user));
        },

        logout() {
            console.log("--- user_store.js (1) ---");
            console.log("Estado ANTES de $reset:", { token: this.token, role: this.role });

            // 1. Borra el estado en memoria (Pinia)
            this.$reset();

            console.log("--- user_store.js (2) ---");
            console.log("Estado DESPUÉS de $reset:", { token: this.token, role: this.role });

            // 2. Borra el estado persistente (LocalStorage)
            localStorage.removeItem('user');
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_role');

            console.log("--- user_store.js (3) ---");
            console.log("LocalStorage 'user_token' AHORA ES:", localStorage.getItem('user_token'));
        }

    }
});