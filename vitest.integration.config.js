import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },
    test: {
        environment: 'jsdom',
        // Same origin as the Vite dev server, so CORS is exercised too.
        environmentOptions: { jsdom: { url: 'http://localhost:5173' } },
        include: ['tests/integration/**/*.spec.js'],
        testTimeout: 20000,
        // Tests share one account and depend on each other.
        sequence: { concurrent: false }
    }
})
