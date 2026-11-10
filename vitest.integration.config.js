import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Integration tests: the real API layer of the web app against a real local backend.
// Run with `npm run test:integration` (see tests/integration/auth-flow.integration.spec.js).
export default defineConfig({
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },
    test: {
        environment: 'jsdom',
        // Same origin as the Vite dev server: the backend's CORS policy only allows that origin in Development,
        // so these requests also check that the web app is allowed to call the API from a browser.
        environmentOptions: { jsdom: { url: 'http://localhost:5173' } },
        include: ['tests/integration/**/*.spec.js'],
        testTimeout: 20000,
        // The scenarios depend on each other (sign up, then verify, then sign in), so they run in order.
        sequence: { concurrent: false }
    }
})
