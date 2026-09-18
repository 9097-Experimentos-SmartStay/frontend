import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '/api': {
                 target: 'https://smart-backend-y5q6.onrender.com/api/v1',
                //target: 'http://localhost:5192',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})